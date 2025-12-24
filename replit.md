# StationScout

## Overview
StationScout is an Expo React Native mobile application for discovering Ticketmaster events near UK train stations. Users follow the journey: select Train Operating Company → choose railway line → view stations → discover events (within 50km radius) with booking links and images → bookmark and share.

## Project Architecture

### Tech Stack
- **Framework**: Expo (React Native) v54
- **UI Library**: React Native Paper
- **Navigation**: React Navigation (Native Stack)
- **Backend**: Supabase (Authentication, Database)
- **Offline Storage**: WatermelonDB with LokiJS/IndexedDB (web)
- **State Management**: Zustand, React Query
- **Language**: TypeScript

### Directory Structure
```
/
├── App.tsx                 # Main app entry with providers
├── index.js                # Expo entry point
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
├── babel.config.js         # Babel with decorators
├── tsconfig.json           # TypeScript config
├── src/
│   ├── data/
│   │   ├── data_sources/
│   │   │   ├── supabase_client.ts    # Supabase client singleton
│   │   │   ├── offline_database.ts   # WatermelonDB setup
│   │   │   └── SyncService.ts        # Data sync from Supabase
│   │   ├── db/
│   │   │   ├── schema.ts             # WatermelonDB schema (v3)
│   │   │   └── models.ts             # Model classes
│   │   ├── repositories/
│   │   │   └── EventRepository.ts    # Data access layer
│   │   └── store/                    # Zustand stores
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── Card.tsx              # Event/item cards with images
│   │   │   ├── ErrorBoundary.tsx     # Error handling wrapper
│   │   │   ├── GradientHeader.tsx    # Screen headers
│   │   │   ├── ListItem.tsx          # Simple list items
│   │   │   └── Centered.tsx          # Layout helper
│   │   ├── hooks/                    # Custom hooks
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx      # Main navigation setup
│   │   ├── screens/
│   │   │   ├── auth/                 # Login, SignUp, Profile
│   │   │   ├── discovery/            # TOC, Lines, Stations, Events, EventDetail
│   │   │   ├── HomeScreen.tsx        # Main home screen
│   │   │   ├── BookmarksScreen.tsx   # Saved events
│   │   │   └── MapScreen.tsx         # Explore by region
│   │   └── theme/
│   │       └── colors.ts             # Theme configuration
│   └── types/                        # TypeScript definitions
└── assets/                           # Images and icons
```

## Environment Variables

Required in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Running the App

### Development (Web)
```bash
npx expo start --web --port 5000 --tunnel
```

### Mobile (Expo Go)
Scan the QR code displayed in the terminal with Expo Go app.

### Build for Production
```bash
npm run build:production
```

## Features

### Implemented
- **User authentication** (Login, SignUp, Logout via Supabase)
- **Event discovery** (TOC → Lines → Stations → Events flow)
- **Search functionality** on all list screens
- **Pull-to-refresh** on all data screens
- **Event details** with images, dates, venue info
- **Booking links** direct to Ticketmaster
- **Event sharing** via native Share API
- **Bookmarking** with offline access
- **Explore by Region** (Browse events near UK cities)
- **Auto-sync** on app launch and every 5 minutes
- **Ticketmaster refresh** via Edge Function
- **Error boundary** for graceful error handling
- **Offline-first** storage with WatermelonDB

### Data Flow
1. App launches → Auto-sync triggered
2. SyncService calls Edge Function to refresh Ticketmaster data
3. Data synced from Supabase to local WatermelonDB
4. Screens query local database for fast, offline-capable access
5. Background sync every 5 minutes while app is active

## UI Design
- **Brand colors**: Navy (#1E3A5F) and Orange (#F97316)
- **Modern card-based layouts** with images and badges
- **Search bars** on all list screens
- **Pull-to-refresh** across the app
- **Consistent headers** with back navigation

## Recent Changes (December 2024)

### Phase 1: Code Cleanup
- Deleted unused directories: components/, hooks/, constants/, scripts/, contexts/, domain/, Theme/, services/
- Cleaned up debug console.log statements
- Updated src/README.md with simplified structure
- Fixed database batch performance warnings

### Phase 2: Backend Fixes
- Improved SyncService with better error handling
- Fixed Edge Function invocation using fetch
- All batch operations use array syntax for performance

### Phase 3: Frontend Polish
- Added pull-to-refresh to LineScreen, StationListScreen, EventListScreen, BookmarksScreen
- Added search bars to all list screens
- Added ErrorBoundary component for graceful error handling
- Improved loading states across all screens

### Phase 4: Feature Completion
- Implemented "Explore by Region" screen with UK city filters (list-based, no map visualization)
- Added sharing functionality to EventDetailScreen
- Enhanced BookmarksScreen with search and images
- Updated HomeScreen with Map navigation card

### Phase 5 & 6: Testing & Deployment
- Created eas.json for EAS Build configuration
- Added build scripts to package.json
- Skipped test setup due to React 19 compatibility issues

## Supabase Schema Mapping
- `train_operators` (id, name, code) → local `train_operators`
- `railway_lines` (id, name, toc_id) → local `railway_lines` (operator_id = toc_id)
- `stations` (id, name, crs_code, location) → local `stations` (lat/lng parsed from PostGIS hex)
- `events` (source_id, name, url, image_url...) → local `events`

## Known Limitations
- Web mode uses LokiJS adapter (IndexedDB) instead of SQLite
- Station-Line relationship not in Supabase schema (shows all stations)
- Bookmarks are local only (don't sync across devices)
- Events filtered to Ticketmaster source only
- 50km radius for event proximity filtering

## Deployment

### EAS Build Profiles
- `development` - For local development with dev client
- `preview` - Internal testing builds
- `production` - App store ready builds

### Build Commands
```bash
npm run build:preview    # Build for internal testing
npm run build:production # Build for app stores
npm run submit           # Submit to app stores
```
