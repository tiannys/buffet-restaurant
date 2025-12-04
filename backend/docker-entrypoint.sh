#!/bin/sh
set -e

echo "🚀 Starting buffet restaurant backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z postgres 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "✅ Database is ready!"

# Run database seed if admin user doesn't exist
echo "🌱 Checking if database needs seeding..."
node dist/database/seed.js || echo "ℹ️  Seeding skipped or already completed"

# Start the application
echo "🎉 Starting NestJS application..."
exec node dist/main.js
