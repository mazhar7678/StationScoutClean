# Deploy Ticketmaster Refresh Edge Function

This guide walks you through deploying the Edge Function to your Supabase project.

## Prerequisites

1. **Ticketmaster API Key** - Get one free at https://developer.ticketmaster.com/
2. **Supabase CLI** - Install it: `npm install -g supabase`

## Step 1: Get Your Ticketmaster API Key

1. Go to https://developer.ticketmaster.com/
2. Sign up for a free account
3. Create an app and copy your **Consumer Key** (this is your API key)

## Step 2: Login to Supabase CLI

```bash
npx supabase login
```

## Step 3: Link Your Project

```bash
npx supabase link --project-ref zedtukxxdasncddsmvrd
```

## Step 4: Set the Ticketmaster API Key Secret

Supabase Edge Functions have built-in access to `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` - you don't need to set these manually.

You only need to add the Ticketmaster API key as a secret (secrets are stored securely and never exposed):

```bash
npx supabase secrets set TICKETMASTER_API_KEY=your_api_key_here
```

**Security Note:** Secrets are encrypted and only accessible to your Edge Functions. Never commit API keys to your code.

## Step 5: Deploy the Function

```bash
npx supabase functions deploy refresh-ticketmaster-events --no-verify-jwt
```

The `--no-verify-jwt` flag allows the app to call the function without authentication.

## Step 6: Test the Function

After deploying, test it with:

```bash
curl "https://zedtukxxdasncddsmvrd.supabase.co/functions/v1/refresh-ticketmaster-events"
```

You should see a response like:
```json
{
  "success": true,
  "message": "Refreshed 350 events from Ticketmaster",
  "totalFetched": 500,
  "validEvents": 350,
  "inserted": 350
}
```

## Step 7: Reload the App

After the function runs successfully, reload your StationScout app. It will sync the fresh events on startup.

## Troubleshooting

- **"TICKETMASTER_API_KEY is required"** - Make sure you set the secret in Step 4
- **Rate limiting** - The function fetches from 10 UK cities with delays to avoid rate limits
- **No events showing** - The function only imports events with images, URLs, and location data
