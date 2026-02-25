# ── Stage 1: dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Stage 2: runtime ───────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
