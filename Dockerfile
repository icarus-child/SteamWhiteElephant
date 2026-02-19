# ----------------------------
# 1️⃣ Build Stage
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --audit false --fund false
RUN npx next-ws patch

# Copy source code
COPY . .

# Build Next.js app
ENV NODE_OPTIONS=--max-old-space-size=768
RUN npm run build

# ----------------------------
# 2️⃣ Production Stage
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "server.js"]
