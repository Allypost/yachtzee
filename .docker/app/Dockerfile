FROM node:18-alpine as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --immutable

RUN yarn build

FROM node:18-alpine as runner

COPY --from=builder /app/build /app

WORKDIR /app

RUN yarn install --production

CMD ["node", "server.js"]
