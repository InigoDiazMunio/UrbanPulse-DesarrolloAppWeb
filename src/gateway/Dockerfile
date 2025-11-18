# Node 18 LTS
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package.json package-lock.json* ./

# Cambiar npm ci por npm install
RUN npm install --only=production

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "app.js"]
