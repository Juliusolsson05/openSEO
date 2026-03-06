# ── Build stage ────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

ARG AUTH_SECRET=docker-build-auth-secret
ARG OPENSEO_ENCRYPTION_KEY=QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE=
ENV AUTH_SECRET=$AUTH_SECRET
ENV OPENSEO_ENCRYPTION_KEY=$OPENSEO_ENCRYPTION_KEY

COPY package.json package-lock.json .npmrc ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ARG AUTH_SECRET=docker-build-auth-secret
ARG OPENSEO_ENCRYPTION_KEY=QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE=
ENV AUTH_SECRET=$AUTH_SECRET
ENV OPENSEO_ENCRYPTION_KEY=$OPENSEO_ENCRYPTION_KEY

# Install only production dependencies
COPY package.json package-lock.json .npmrc ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Re-generate Prisma client for production deps
RUN npx prisma generate

# Copy build output and static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
