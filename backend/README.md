# Backend API

NestJS backend for Buffet Restaurant QR Ordering System.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run start:dev
```

## API Documentation

See [API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Project Structure

```
src/
├── auth/           # Authentication & JWT
├── users/          # User management
├── packages/       # Package management
├── menus/          # Menu management
├── tables/         # Table management
├── sessions/       # Session management
├── orders/         # Order management
├── billing/        # Billing & receipts
├── loyalty/        # Loyalty program
├── reports/        # Reports
├── settings/       # Settings
├── uploads/        # File uploads
├── database/       # Database config & migrations
└── main.ts         # Application entry point
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
