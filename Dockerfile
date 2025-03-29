FROM node:22-alpine AS base
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app && chown -R nextjs:nodejs /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    INFERENCE_GATEWAY_URL="http://localhost:8080/v1"
EXPOSE 3000
USER nextjs:nodejs
WORKDIR /app

FROM base AS dev
USER node:node
ENV NODE_ENV=development
VOLUME [ "/app" ]
CMD [ "npm", "run", "dev" ]

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS prod
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
