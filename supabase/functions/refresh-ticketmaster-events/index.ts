import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates?: {
    start?: {
      dateTime?: string;
      localDate?: string;
    };
    end?: {
      dateTime?: string;
    };
  };
  images?: Array<{ url: string; width: number; height: number }>;
  classifications?: Array<{ segment?: { name: string }; genre?: { name: string } }>;
  priceRanges?: Array<{ min: number; max: number }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      address?: { line1: string };
      city?: { name: string };
      country?: { name: string };
      location?: { latitude: string; longitude: string };
    }>;
  };
  info?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TICKETMASTER_API_KEY = Deno.env.get("TICKETMASTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TICKETMASTER_API_KEY) {
      throw new Error("TICKETMASTER_API_KEY is required");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const ukCities = [
      { keyword: "London", latlong: "51.5074,-0.1278" },
      { keyword: "Manchester", latlong: "53.4808,-2.2426" },
      { keyword: "Birmingham", latlong: "52.4862,-1.8904" },
      { keyword: "Liverpool", latlong: "53.4084,-2.9916" },
      { keyword: "Leeds", latlong: "53.8008,-1.5491" },
      { keyword: "Glasgow", latlong: "55.8642,-4.2518" },
      { keyword: "Edinburgh", latlong: "55.9533,-3.1883" },
      { keyword: "Bristol", latlong: "51.4545,-2.5879" },
      { keyword: "Newcastle", latlong: "54.9783,-1.6178" },
      { keyword: "Sheffield", latlong: "53.3811,-1.4701" },
    ];

    const allEvents: TicketmasterEvent[] = [];
    const seenIds = new Set<string>();

    for (const city of ukCities) {
      const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
      url.searchParams.set("apikey", TICKETMASTER_API_KEY);
      url.searchParams.set("countryCode", "GB");
      url.searchParams.set("latlong", city.latlong);
      url.searchParams.set("radius", "50");
      url.searchParams.set("unit", "km");
      url.searchParams.set("size", "100");
      url.searchParams.set("sort", "date,asc");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      url.searchParams.set("startDateTime", startDate.toISOString().split(".")[0] + "Z");
      url.searchParams.set("endDateTime", endDate.toISOString().split(".")[0] + "Z");

      try {
        const response = await fetch(url.toString());
        if (!response.ok) {
          console.error(`Failed to fetch events for ${city.keyword}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const events = data._embedded?.events || [];

        for (const event of events) {
          if (!seenIds.has(event.id)) {
            seenIds.add(event.id);
            allEvents.push(event);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Error fetching events for ${city.keyword}:`, error);
      }
    }

    console.log(`Fetched ${allEvents.length} unique events from Ticketmaster`);

    const eventsToUpsert = allEvents.map((event) => {
      const venue = event._embedded?.venues?.[0];
      const bestImage = event.images?.reduce((best, img) => 
        (!best || img.width > best.width) ? img : best, null as { url: string; width: number } | null
      );
      const category = event.classifications?.[0]?.segment?.name || 
                       event.classifications?.[0]?.genre?.name || "Event";

      let location = null;
      if (venue?.location?.latitude && venue?.location?.longitude) {
        const lat = parseFloat(venue.location.latitude);
        const lng = parseFloat(venue.location.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          location = `POINT(${lng} ${lat})`;
        }
      }

      let venueAddress = "";
      if (venue?.address?.line1) venueAddress += venue.address.line1;
      if (venue?.city?.name) venueAddress += (venueAddress ? ", " : "") + venue.city.name;
      if (venue?.country?.name) venueAddress += (venueAddress ? ", " : "") + venue.country.name;

      return {
        source_id: event.id,
        source: "ticketmaster",
        name: event.name,
        description: event.info || null,
        start_date: event.dates?.start?.dateTime || event.dates?.start?.localDate || null,
        end_time: event.dates?.end?.dateTime || null,
        venue_name: venue?.name || null,
        venue_address: venueAddress || null,
        location: location,
        url: event.url,
        image_url: bestImage?.url || null,
        category: category,
        price_min: event.priceRanges?.[0]?.min || null,
        price_max: event.priceRanges?.[0]?.max || null,
        updated_at: new Date().toISOString(),
      };
    });

    const validEvents = eventsToUpsert.filter(e => e.url && e.image_url && e.location);
    console.log(`${validEvents.length} events have URL, image, and location`);

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("source", "ticketmaster");

    if (deleteError) {
      console.error("Error deleting old events:", deleteError);
    }

    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < validEvents.length; i += batchSize) {
      const batch = validEvents.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("events")
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
      } else {
        insertedCount += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed ${insertedCount} events from Ticketmaster`,
        totalFetched: allEvents.length,
        validEvents: validEvents.length,
        inserted: insertedCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
