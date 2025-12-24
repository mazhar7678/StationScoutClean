# StationScout Clean

## Overview
StationScout is an Expo React Native application for discovering events. It features user authentication via Supabase and offline data storage using WatermelonDB.

## Project Architecture

### Tech Stack
- **Framework**: Expo (React Native)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation (Native Stack)
- **Backend**: Supabase (Authentication, Database)
- **Offline Storage**: WatermelonDB with IndexedDB (web)
- **State Management**: Zustand

### Directory Structure
```
/
├── App.tsx                 # Main app entry with providers
├── index.js                # Expo entry point
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration with decorators and module resolver
├── src/
│   ├── contexts/           # React contexts (Theme, SelectedEvent)
│   ├── data/
│   │   ├── data_sources/   # Supabase client, offline DB, sync service
│   │   ├── db/             # WatermelonDB schema
│   │   ├── repositories/   # Data access layer
│   │   └── store/          # Zustand stores
│   ├── domain/
│   │   ├── entities/       # Domain models
│   │   └── use_cases/      # Business logic
│   ├── presentation/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── navigation/     # Navigation configuration
│   │   ├── screens/        # Screen components
│   │   └── viewmodels/     # Theme and view models
│   ├── services/           # External service integrations
│   ├── Theme/              # Theme configuration
│   └── types/              # TypeScript type definitions
├── assets/                 # Images and icons
├── components/             # Legacy components
├── constants/              # App constants
└── hooks/                  # Legacy hooks
```

## Environment Variables

The app requires the following environment variables (configured in `.env`):
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Running the App

### Development (Web)
```bash
npx expo start --web --port 5000 --host lan
```

The app runs on port 5000 in web mode.

## Features
- User authentication (Sign In, Sign Up)
- Event discovery and listing
- Offline data sync with WatermelonDB
- Station and line information

## Recent Changes
- Initial setup for Replit environment (December 2024)
- Configured Expo web to run on port 5000
- App uses `--host lan` for proper Replit iframe proxy support
