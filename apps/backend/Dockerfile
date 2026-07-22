# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma Alpine engine support
RUN apk add --no-cache openssl

# Copy root and backend files (supporting both root build context and apps/backend build context)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY prisma ./apps/backend/prisma/
COPY apps/backend/prisma* ./apps/backend/prisma/

# Install backend dependencies
RUN if [ -d "apps/backend" ]; then npm --prefix apps/backend install; else npm install; fi

# Copy source code
COPY . .

# Generate Prisma Client & Build NestJS App
RUN if [ -d "apps/backend" ]; then npm --prefix apps/backend run prisma:generate && npm --prefix apps/backend run build; else npx prisma generate --schema=prisma/schema.prisma && npm run build; fi

# ==========================================
# STAGE 2: Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Create uploads directory with non-root permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy built node_modules and dist artifacts from builder stage
COPY --chown=node:node --from=builder /app/apps/backend/package*.json ./
COPY --chown=node:node --from=builder /app/apps/backend/prisma ./prisma/
COPY --chown=node:node --from=builder /app/apps/backend/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/backend/dist ./dist

USER node

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --skip-generate || true && node dist/src/main.js"]
