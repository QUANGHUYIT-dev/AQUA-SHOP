# ==========================================
# 1. Stage Builder: Cài đặt và build ứng dụng
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm install

COPY . .
RUN npm run build

# ==========================================
# 2. Stage Runner: Môi trường Production tối giản
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy các file và thư mục đã build từ stage 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]