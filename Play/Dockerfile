# ---------- Dependencies ----------
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# ---------- Builder ----------
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ENV NEXT_PUBLIC_BASE_URL=https://api.yaralex.com
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=940538258951-mepajb01hrgf29h74ppv62k0bkub3qnf.apps.googleusercontent.com
RUN npm run build

# ---------- Runner ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

# ---------- Development ----------
# ENV NODE_ENV development
# COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
# COPY --from=builder --chown=nextjs:nodejs /app/ ./
# RUN npm install next --no-save
# CMD ["npm", "run", "dev"]
# ---------- Production ----------
CMD ["node", "server.js"]
