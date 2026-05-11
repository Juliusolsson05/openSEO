# ── Build stage ────────────────────────────────────────────
FROM node:26-alpine AS builder
WORKDIR /app

# Build-time-ONLY placeholders. NextAuth and the settings vault import their
# secrets at module-init time, so `next build` needs *some* value present.
# These values are NOT inherited by the runner stage and never ship in the
# final image. Real secrets must be supplied at runtime via --env-file,
# Docker secrets, or an orchestrator (Compose / K8s / Fly / etc.).
ARG AUTH_SECRET=build-time-placeholder-not-a-real-secret
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
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# NO AUTH_SECRET / OPENSEO_ENCRYPTION_KEY defaults here on purpose.
# The server's instrumentation hook refuses to boot unless both are supplied
# at runtime.

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
COPY --from=builder /app/instrumentation.ts ./
COPY --from=builder /app/tsconfig.json ./
# Copy source for standalone worker (tsx runs TypeScript directly)
COPY --from=builder /app/src ./src

# Create uploads directory for local storage
RUN mkdir -p /app/uploads

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
