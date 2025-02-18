FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
