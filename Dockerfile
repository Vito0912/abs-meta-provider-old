FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

RUN mkdir -p data

EXPOSE 8723

ENV PORT=8723

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8723/health', (res) => { \
    res.statusCode === 200 ? process.exit(0) : process.exit(1) \
  }).on('error', () => process.exit(1))"

CMD ["npm", "start"]
