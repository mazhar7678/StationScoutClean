# StationScout

## Overview
StationScout is an Expo React Native mobile application for discovering events near train stations. Users can browse train operators, railway lines, and stations to find local events. The app uses Supabase for authentication and backend data, with WatermelonDB providing offline-first data storage.

## Project Architecture

### Tech Stack
- **Framework**: Expo (React Native)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation (Native Stack)
- **Backend**: Supabase (Authentication, Database)
- **Offline Storage**: WatermelonDB with LokiJS/IndexedDB (web)
- **State Management**: Zustand, React Query
- **Language**: TypeScript

### Directory Structure
```
/
├── App.tsx                 # Main app entry with providers (QueryClient, Database, Paper)
├── index.js                # Expo entry point
├── app.json                # Expo configuration
├── babel.config.js         # Babel with decorators and class properties
├── tsconfig.json           # TypeScript config with decorators enabled
├── src/
│   ├── data/
│   │   ├── data_sources/
│   │   │   ├── supabase_client.ts    # Supabase client singleton
│   │   │   ├── offline_database.ts   # WatermelonDB setup
│   │   │   └── SyncService.ts        # Data sync from Supabase
│   │   ├── db/
│   │   │   ├── schema.ts             # WatermelonDB schema
│   │   │   └── models.ts             # Model classes with decorators
│   │   ├── repositories/
│   │   │   └── EventRepository.ts    # Data access layer
│   │   └── store/                    # Zustand stores
│   ├── domain/
│   │   ├── entities/       # Domain models
│   │   └── use_cases/      # Business logic
│   ├── presentation/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom hooks (useSyncService)
│   │   ├── navigation/     # AppNavigator, AuthStack
│   │   ├── screens/        # Screen components
│   │   └── viewmodels/     # Theme configuration
│   └── types/              # TypeScript definitions
├── assets/                 # Images and icons
└── .env                    # Environment variables (not committed)
```

## Environment Variables

Required in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Running the App

### Development (Web)
The app runs on port 5000 in tunnel mode:
```bash
npx expo start --web --port 5000 --tunnel
```

### Mobile (Expo Go)
Scan the QR code displayed in the terminal with Expo Go app.

## Key Components

### WatermelonDB Models
- **Event** - Local events with venue info and coordinates
- **TrainOperator** - Train companies/operators
- **RailwayLine** - Railway lines belonging to operators
- **Station** - Stations on railway lines
- **Bookmark** - User bookmarked events
- **PendingChange** - Offline changes pending sync

### Data Flow
1. App loads with DatabaseProvider and QueryClientProvider
2. User authenticates via Supabase
3. SyncService pulls data from Supabase to local WatermelonDB
4. Screens query local database for offline-first experience

## Features
- User authentication (Sign In, Sign Up)
- Event discovery and listing
- Offline data sync with WatermelonDB
- Station and railway line browsing
- Event bookmarking

## Recent Changes (December 2024)
- Fixed WatermelonDB model classes with proper Babel decorator configuration
- Added SyncService with error handling and Supabase readiness checks
- Configured React Query provider for data fetching
- Updated babel.config.js with decorator and class properties plugins
- Fixed import paths to use relative imports
- Removed duplicate Supabase client files
- App successfully loads on Expo web with login screen

## Known Limitations
- Web mode uses LokiJS adapter (IndexedDB) instead of SQLite
- Some React Native animations fall back to JS on web
- Tunnel mode required for mobile device access in Replit environment
