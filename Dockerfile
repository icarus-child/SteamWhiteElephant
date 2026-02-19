# ----------------------------
# 1️⃣ Build Stage
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --audit false --fund false
RUN yes | npx next-ws patch

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

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
