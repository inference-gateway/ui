FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git curl
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci && npm cache clean --force
COPY src/ ./src/
RUN npm run build
RUN npm prune --production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN mkdir -p /tmp/mcp-files && chown nodejs:nodejs /tmp/mcp-files
USER nodejs
EXPOSE 3001
CMD ["npm", "start"]
