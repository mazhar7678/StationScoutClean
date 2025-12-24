import { createClient } from '@supabase/supabase-js';

// Direct hardcoded values for reliability
const supabaseUrl = 'https://zedtukxxdasncddsmvrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZHR1a3h4ZGFzbmNkZHNtdnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDc4MzksImV4cCI6MjA2NzQ4MzgzOX0.GQi-tYiuUrXZdIv9gueNsw0RxSINzInSHCNnCC0Q_oc';

console.log('🔑 Initializing Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);

// Create the Supabase client with explicit options for web
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log('✅ Supabase client created');

// Define the Event type based on your database schema
export interface Event {
  id: string;
  name: string;
  start_date: string;
  url: string;
  venue_name: string | null;
  venue_address: string | null;
  source: string;
  source_id: string;
  location: string | null;
  image_url?: string | null;
  created_at?: string;
}

// Fetch events from Supabase
export async function fetchEvents(limit: number = 20) {
  try {
    console.log('🔍 Fetching events from Supabase...');
    console.log('🔍 Query: SELECT * FROM events ORDER BY start_date ASC LIMIT', limit);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })
      .limit(limit);
    
    console.log('🔍 Response received');
    console.log('🔍 Data:', data);
    console.log('🔍 Error:', error);
    
    if (error) {
      console.error('❌ Supabase error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    console.log('✅ Got events from database:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Exception fetching events:', error);
    return [];
  }
}

// Fetch events by location
export async function fetchEventsByLocation(location: string, limit: number = 20) {
  try {
    console.log('🔍 Fetching events for location:', location);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('start_date', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return [];
    }
    
    console.log('✅ Got events for location:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    return [];
  }
}