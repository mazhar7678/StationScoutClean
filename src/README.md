# StationScout Mobile Source Structure

The `src` directory follows the Clean Architecture guidance from the StationScout Mobile blueprint. Each layer has a single responsibility and communicates with adjacent layers through clearly defined contracts.

## Presentation

- `components/`: Reusable, platform-specific building blocks (buttons, layout helpers, theming utilities).
- `screens/`: UI surfaces composed of components and driven by view models.
- `navigation/`: React Navigation stacks, tabs, and deep-link configuration.
- `viewmodels/`: State containers (e.g., Zustand stores) that orchestrate presentation logic and coordinate with domain use cases.

## Domain

- `entities/`: Immutable business models shared between layers.
- `use_cases/`: Stateless operations that encapsulate application-specific business logic. They depend on abstract repositories rather than concrete data sources.

## Data

- `repositories/`: Concrete implementations of domain repositories. They adapt external services to the domain layer.
- `data_sources/`: Gateways to remote APIs, databases, and device storage (e.g., Supabase, WatermelonDB adapters). Infrastructure code lives here.

```
Presentation -> Domain -> Data
```

Data dependencies never point back up the tree, ensuring UI concerns remain isolated from persistence details.
