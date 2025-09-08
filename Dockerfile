# ---------- Build stage ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
# install devDependencies juga, karena perlu untuk build
RUN npm ci

COPY . .
# (opsional) kalau kamu memang ingin build mode production:
ENV NODE_ENV=production
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-alpine AS runtime
WORKDIR /app
USER node

COPY --from=builder --chown=node:node /app/.output/ ./.output/
COPY --from=builder --chown=node:node /app/package*.json ./

# Tidak set ENV di sini; biar di compose/.env
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
