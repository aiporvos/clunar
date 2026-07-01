FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cache de Docker)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build (requiere SITE_URL para sitemap)
ARG SITE_URL=https://cluna.ar
ENV SITE_URL=$SITE_URL
ENV NODE_ENV=production

RUN npm run build

# ─── Imagen de producción ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Solo lo necesario para correr
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321


CMD ["node", "./dist/server/entry.mjs"]
