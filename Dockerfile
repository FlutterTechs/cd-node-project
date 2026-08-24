FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

USER node

CMD ["node", "server.js"]
