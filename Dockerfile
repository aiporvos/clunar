FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias primero (cache de Docker)
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build (requiere SITE_URL para sitemap)
ARG SITE_URL=https://tudominio.com
ENV SITE_URL=$SITE_URL
ENV NODE_ENV=production

RUN pnpm build

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

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:4321/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
