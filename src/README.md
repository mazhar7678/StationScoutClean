# StationScout Mobile Source Structure

The `src` directory follows a simplified Clean Architecture pattern.

## Directory Structure

```
src/
├── data/                  # Data layer
│   ├── data_sources/      # Supabase, WatermelonDB, Secure Storage
│   ├── db/                # Database schema and models
│   ├── repositories/      # Data access interfaces
│   └── store/             # Zustand state stores
├── presentation/          # UI layer
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # Screen components
│   ├── theme/             # Colors and styling
│   └── viewmodels/        # View configuration
└── types/                 # TypeScript type definitions
```

## Data Flow

```
User Action → Screen → Repository → SyncService → Supabase
                                                 ↓
                                          WatermelonDB
                                                 ↓
                                          Screen (reactive)
```

## Key Components

- **SyncService**: Orchestrates data sync between Supabase and local WatermelonDB
- **EventRepository**: Provides queries for accessing local event data
- **SupabaseClient**: Singleton for Supabase auth and database operations
- **authStore**: Zustand store for authentication state
