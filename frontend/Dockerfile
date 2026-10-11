# Multi-stage Dockerfile for Next.js Frontend (Standalone Output)
FROM node:18-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Stage 2: Rebuild source code with fail-fast validation
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arguments (Baked into JS client bundle at build time)
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_INTERNAL_URL
ARG ALLOW_LOCAL_API=true

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV ALLOW_LOCAL_API=$ALLOW_LOCAL_API
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fail-fast build: any TypeScript or ESLint errors will terminate the build
RUN npm run build

# Stage 3: Production runner (Standalone mode with non-root user)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
