#!/bin/sh

# Run the Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node dist/src/main.js
