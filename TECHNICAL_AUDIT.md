# StationScout - Technical Audit Report
**Date:** December 24, 2024

---

## 1. Project Overview

### What the App Does
StationScout is a mobile app that helps users discover Ticketmaster events near train stations in the UK. Users can:
- Browse train operators (TOCs)
- View railway lines for each operator
- See stations on those lines
- Find events within 50km of any station
- Bookmark events for later
- Open event pages to purchase tickets

### Tech Stack
- **Framework:** Expo (React Native) - runs on iOS, Android, and Web
- **UI Library:** React Native Paper (Material Design)
- **Backend:** Supabase (PostgreSQL database + Edge Functions)
- **Offline Storage:** WatermelonDB with LokiJS adapter
- **State Management:** Zustand + React Query
- **Navigation:** React Navigation (Native Stack)
- **Authentication:** Supabase Auth with secure credential storage

---

## 2. Codebase Audit

### Directory Structure Analysis
```
/
├── App.tsx                    ✅ Main entry - auto-sync on launch
├── src/
│   ├── data/                  ✅ Clean data layer
│   │   ├── data_sources/      ✅ Supabase + WatermelonDB
│   │   ├── db/                ✅ Schema + Models
│   │   ├── repositories/      ✅ Data access layer
│   │   └── store/             ✅ Zustand auth store
│   ├── domain/                ⚠️ Partially used
│   ├── presentation/          ✅ UI components & screens
│   └── types/                 ✅ TypeScript definitions
├── components/                ⚠️ UNUSED - legacy from Expo template
├── hooks/                     ⚠️ UNUSED - legacy from Expo template
├── constants/                 ⚠️ UNUSED - legacy from Expo template
├── scripts/                   ⚠️ UNUSED - reset-project script
└── attached_assets/           📁 Development assets (can be removed for production)
```

### File-by-File Status

#### Core App Files
| File | Status | Notes |
|------|--------|-------|
| `App.tsx` | ✅ Working | Auto-sync on launch + foreground |
| `index.js` | ✅ Working | Expo entry point |
| `app.json` | ✅ Working | Expo configuration |
| `babel.config.js` | ✅ Working | Decorators + class properties |
| `tsconfig.json` | ✅ Working | Strict mode enabled |

#### Data Layer
| File | Status | Notes |
|------|--------|-------|
| `SyncService.ts` | ✅ Fixed | Calls Edge Function + syncs data |
| `supabase_client.ts` | ✅ Working | Singleton with auth config |
| `offline_database.ts` | ✅ Working | LokiJS adapter for web |
| `schema.ts` | ✅ Working | v3 with image_url field |
| `models.ts` | ✅ Working | WatermelonDB models |
| `EventRepository.ts` | ⚠️ Partial | eventsByStation uses wrong field |
| `userRepository.ts` | ⚠️ Empty | Not implemented |

#### Screens
| Screen | Status | Notes |
|--------|--------|-------|
| `HomeScreen.tsx` | ✅ Working | Main entry with navigation cards |
| `LoginScreen.tsx` | ✅ Working | Email/password auth |
| `SignUpScreen.tsx` | ✅ Working | New user registration |
| `ProfileScreen.tsx` | ✅ Working | Session management + logout |
| `TOCScreen.tsx` | ✅ Working | Train operator list |
| `LineScreen.tsx` | ✅ Working | Railway lines per operator |
| `StationListScreen.tsx` | ✅ Working | All stations (no line filter) |
| `EventListScreen.tsx` | ✅ Working | 50km geo-filtered events with images |
| `EventDetailScreen.tsx` | ✅ Working | Event details + booking button |
| `BookmarksScreen.tsx` | ✅ Working | Saved events |

---

## 3. Issues & Risks

### Critical Issues (Must Fix)
| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| None currently | - | - | - |

### High Priority (Should Fix)
| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Edge Function CORS warning | `SyncService.ts` | UI shows error (function still works) | Add CORS headers to Edge Function |
| Station-Line relationship missing | Supabase schema | Stations not filtered by line | Add railway_lines_stations junction table |
| Unused legacy files | `/components`, `/hooks`, `/constants` | Confusion, larger bundle | Delete unused directories |

### Medium Priority (Nice to Fix)
| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Database batch warning | `SyncService.ts` | Performance log noise | Pass array instead of spread |
| userRepository empty | `src/data/repositories` | Unused file | Remove or implement |
| Tabs.tsx not used | Navigation | Dead code | Already using AppNavigator |
| DiscoveryStack.tsx not used | Navigation | Dead code | Already using AppNavigator |

### Low Priority (Polish)
| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Sample URL in logs | `SyncService.ts` | Debug noise | Remove console.log statements |
| ThemeContext.tsx unused | `src/contexts` | Dead code | Remove |
| SelectedEventContext.tsx unused | `src/contexts` | Dead code | Remove |

---

## 4. Backend Review

### Supabase Tables
| Table | Status | Frontend Usage |
|-------|--------|----------------|
| `train_operators` | ✅ Active | TOCScreen lists all operators |
| `railway_lines` | ✅ Active | LineScreen filters by toc_id |
| `stations` | ✅ Active | StationListScreen shows all |
| `events` | ✅ Active | EventListScreen geo-filters |
| `bookmarks` | ⚠️ Local only | WatermelonDB, not synced to Supabase |

### Supabase Edge Functions
| Function | Last Run | Status | Purpose |
|----------|----------|--------|---------|
| `fetch-ticketmaster-events` | Dec 24, 2024 | ✅ Working | Fetches events from Ticketmaster API |
| `fetch-predicthq-events` | 5 months ago | ⚠️ Unused | Not used (filtered out) |
| `fetch-eventbrite-events` | 5 months ago | ⚠️ Unused | Not used (filtered out) |
| `populate-railway-lines` | 5 months ago | ✅ Working | One-time setup |
| `create-subscription` | 5 months ago | ❓ Unknown | Subscription management |
| `manage-subscription` | 5 months ago | ❓ Unknown | Subscription management |

### Data Flow
```
1. App Launch
   └── App.tsx → syncAll()
       ├── refreshTicketmasterEvents() → Supabase Edge Function
       │   └── Edge Function → Ticketmaster API → Insert to Supabase
       └── syncEvents() → Supabase → WatermelonDB
           └── Filters: source=ticketmaster, has url, has image_url

2. User Browsing
   └── HomeScreen → TOCScreen → LineScreen → StationListScreen → EventListScreen
       └── EventListScreen queries WatermelonDB with 50km geo-filter

3. Bookmarking
   └── EventDetailScreen → WatermelonDB bookmarks table (local only)
```

---

## 5. Cleanup Recommendations

### Files to DELETE (Unused)
```
/components/               # Legacy Expo template
/hooks/                    # Legacy Expo template  
/constants/                # Legacy Expo template
/scripts/                  # Unused reset script
/src/contexts/             # Unused context files
/src/presentation/navigation/Tabs.tsx      # Replaced by AppNavigator
/src/presentation/navigation/DiscoveryStack.tsx  # Replaced by AppNavigator
/src/data/repositories/userRepository.ts   # Empty file
/src/domain/               # Mostly empty, consolidate
/attached_assets/          # Dev assets (keep for reference or remove for prod)
```

### Files to KEEP & IMPROVE
```
/App.tsx                   # Good - add error boundary
/src/data/data_sources/    # Good - remove debug logs
/src/presentation/         # Good - main UI code
```

### Files to ADD
```
/src/utils/constants.ts    # Centralize magic numbers (50km, sync interval)
/src/utils/geo.ts          # Extract geo calculations
/tests/                    # Add unit tests
```

---

## 6. Development Roadmap

### Phase 1: Code Cleanup (1-2 hours)
- [ ] Delete unused legacy directories
- [ ] Remove debug console.log statements
- [ ] Delete unused context files
- [ ] Update .gitignore for production

### Phase 2: Backend Fixes (2-4 hours)
- [ ] Add CORS headers to fetch-ticketmaster-events Edge Function
- [ ] Add railway_lines_stations junction table for proper line→station filtering
- [ ] Update station sync to use line relationships

### Phase 3: Frontend Polish (2-4 hours)
- [ ] Add pull-to-refresh on event lists
- [ ] Add loading skeleton states
- [ ] Add error boundaries for crash recovery
- [ ] Implement Map screen (currently placeholder)

### Phase 4: Feature Completion (4-8 hours)
- [ ] Sync bookmarks to Supabase (enable across devices)
- [ ] Add event sharing functionality
- [ ] Add push notifications for bookmarked events
- [ ] Add search functionality

### Phase 5: Testing (4-8 hours)
- [ ] Add unit tests for SyncService
- [ ] Add integration tests for auth flow
- [ ] Add E2E tests for discovery journey

### Phase 6: Deployment (2-4 hours)
- [ ] Configure Expo EAS Build
- [ ] Set up production Supabase project
- [ ] Create iOS/Android builds
- [ ] Submit to App Stores

---

## 7. Testing Plan

### What Needs Testing

| Priority | Area | Test Type | Why |
|----------|------|-----------|-----|
| High | Auth Flow | Integration | Login/logout must work |
| High | Data Sync | Unit | Core functionality |
| High | Geo Filtering | Unit | 50km calculation accuracy |
| Medium | Navigation | E2E | User journey works |
| Medium | Bookmarks | Integration | Saves/retrieves correctly |
| Low | UI Components | Snapshot | Visual consistency |

### Recommended Tools
- **Jest** - Unit testing (already in Expo)
- **React Native Testing Library** - Component testing
- **Detox** - E2E testing for mobile
- **Playwright** - E2E testing for web

### Test Coverage Goals
- 80% coverage for data layer
- 60% coverage for UI components
- 100% coverage for auth flow

---

## 8. Deployment Plan

### Pre-Deployment Checklist
- [ ] Remove all console.log statements
- [ ] Set NODE_ENV=production
- [ ] Verify Supabase production credentials
- [ ] Test on real iOS/Android devices
- [ ] Verify Edge Functions work in production

### Environment Variables
```bash
# Production .env
EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]
```

### Build Commands
```bash
# Install Expo CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for Web
npx expo export --platform web
```

### Deployment Steps
1. Create production Supabase project
2. Run database migrations
3. Deploy Edge Functions
4. Build mobile apps with EAS
5. Submit to App Store Connect / Google Play Console
6. Deploy web version to hosting (Vercel/Netlify/Replit)

---

## 9. Technical Brief (For Developers)

### Architecture Summary
- Clean Architecture with data/domain/presentation layers
- Offline-first with WatermelonDB (IndexedDB on web)
- Supabase for auth, database, and serverless functions
- React Navigation for screen management
- Zustand for global state, React Query for server state

### Key Technologies
- Expo SDK 52
- React Native 0.76
- WatermelonDB 0.28 (LokiJS adapter)
- Supabase JS 2.x
- React Navigation 7.x

### Known Constraints
- Web mode only (no native builds configured yet)
- 50km event radius hardcoded
- No station→line relationship in database
- Bookmarks stored locally only

### Security Considerations
- Auth tokens stored in AsyncStorage (web) / Keychain (native)
- Supabase RLS enabled (assumed)
- No sensitive data exposed in client

---

## 10. User Brief (For Non-Technical People)

### What is StationScout?
StationScout is a mobile app that helps you find events (concerts, shows, attractions) near train stations. Just pick a train company, choose a line, select a station, and see what's happening nearby!

### What Can You Do?
- **Browse:** Pick a train company → see their lines → pick a station
- **Discover:** See events within 50km of that station
- **Save:** Bookmark events you're interested in
- **Book:** Tap to buy tickets on Ticketmaster

### What Problems Does It Solve?
- "I'm traveling by train - what's happening near my destination?"
- "I want to plan a day trip with events and train travel"
- "I want to discover new events near stations I pass through"

### What Still Needs Building?
1. **Map View** - See events on a map (currently a placeholder)
2. **Search** - Find stations or events by name
3. **Notifications** - Get alerts about your bookmarked events
4. **Sharing** - Share events with friends
5. **Sync Bookmarks** - Access bookmarks on multiple devices

### Current Status
The app works! You can:
- Sign up and log in
- Browse train companies, lines, and stations
- See events with pictures and booking links
- Save events to your bookmarks

The app automatically fetches fresh event data from Ticketmaster whenever you open it.
