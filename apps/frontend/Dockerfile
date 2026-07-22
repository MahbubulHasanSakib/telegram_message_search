# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and frontend package files
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/

# Install frontend dependencies
RUN npm --prefix apps/frontend install

# Copy source code
COPY apps/frontend ./apps/frontend

# Build Next.js production bundle
RUN npm --prefix apps/frontend run build

# ==========================================
# STAGE 2: Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --chown=node:node apps/frontend/package.json ./
COPY --chown=node:node --from=builder /app/apps/frontend/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/frontend/.next ./.next
COPY --chown=node:node --from=builder /app/apps/frontend/public ./public

USER node

EXPOSE 3000

CMD ["npm", "run", "start"]
