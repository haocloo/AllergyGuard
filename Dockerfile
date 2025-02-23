# Stage 1: Install dependencies using Bun
FROM imbios/bun-node:18-slim AS deps

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Stage 2: Build the Next.js application
FROM deps AS builder

WORKDIR /app
COPY . .
RUN bun run build

# Stage 3: Prepare the runtime environment
FROM node:18-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# DO NOT DELETE. CURL REQUIRED FOR HEALTHCHECK
RUN apt-get update && apt-get install -y --no-install-recommends curl wget \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user and set permissions
RUN groupadd -r nextjs && useradd --no-log-init -r -g nextjs nextjs

# Copy application files and set ownership to the non-root user
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Change ownership of the app directory
RUN chown -R nextjs:nextjs /app

# Switch to the non-root user
USER nextjs

# Exposed port
EXPOSE 3000
ENV PORT 3000

# DO NOT DELETE. REQUIRED FOR HEALTHCHECK
ENV HOSTNAME "0.0.0.0"

# Start the Next.js server
CMD ["node", "server.js"]