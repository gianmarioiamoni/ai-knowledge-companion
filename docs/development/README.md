# 💻 Development Documentation

Technical documentation for developers working on AI Knowledge Companion.

## Documents

- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete database schema documentation with tables, relationships, and examples
- **[API.md](API.md)** - API endpoints documentation and usage examples
- **[ADR.md](ADR.md)** - Architecture Decision Records - key architectural decisions and rationale
- **[TECH_DEBT.md](TECH_DEBT.md)** - Technical debt tracking and improvement plan
- **[SQL_MIGRATION_ORDER.md](SQL_MIGRATION_ORDER.md)** - Order and dependencies of SQL migrations for database setup

## Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- ESLint configured with strict rules
- Zero `any` types in production code
- Functional programming patterns (no classes)
- Single Responsibility Principle (SRP)

### Testing
- Jest for unit tests
- React Testing Library for component tests
- TDD approach when possible

### Architecture
- Next.js 15 App Router
- Server-Side Rendering (SSR) where possible
- Client components only when necessary
- Supabase for backend (auth, database, storage)
- OpenAI API for AI features

## Related Documentation

- **Setup**: See [../setup/](../setup/)
- **Security**: See [../security/](../security/)
- **Features**: See [../features/](../features/)

