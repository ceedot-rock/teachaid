FROM node:20-alpine
WORKDIR /app
COPY package.json ./
# no prod deps required (native http) — keep layer for future
RUN npm install --omit=dev 2>/dev/null || true
COPY . .
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["node", "server.js"]
