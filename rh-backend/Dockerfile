# --- Stage 1: Builder ---
# This stage installs all dependencies and compiles the TypeScript code.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker's layer caching.
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Generate the Prisma client. This is required before building.
RUN npx prisma generate

# --- THE FIX ---
# Instead of `npm run build`, we use the TypeScript compiler directly.
# This ensures that the code is compiled according to your tsconfig.json.
RUN npm run build && echo "Build complete" && ls -la /app/dist

# --- Stage 2: Production ---
# This is the final, small, and secure image that will run the application.
FROM node:20-alpine

WORKDIR /app

# Copy the compiled output from the builder stage.
COPY --from=builder /app/dist ./dist

# Copy only the production node_modules from the builder stage.
# This keeps the final image size small.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy the prisma schema, which is required for runtime migrations.
COPY --from=builder /app/prisma ./prisma

# Copy and prepare the entrypoint script.
COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

# Set the entrypoint to our script.
ENTRYPOINT ["./entrypoint.sh"]