# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma Alpine engine support
RUN apk add --no-cache openssl

# Copy root and backend package files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

# Install backend dependencies
RUN npm --prefix apps/backend install

# Copy source code
COPY apps/backend ./apps/backend

# Generate Prisma Client & Build NestJS App
RUN npm --prefix apps/backend run prisma:generate
RUN npm --prefix apps/backend run build

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

COPY --chown=node:node apps/backend/package.json ./
COPY --chown=node:node apps/backend/prisma ./prisma/

# Copy built node_modules and dist artifacts from builder stage
COPY --chown=node:node --from=builder /app/apps/backend/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/backend/dist ./dist

USER node

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --skip-generate || true && node dist/src/main.js"]
