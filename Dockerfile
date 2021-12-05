FROM node:16 AS build

WORKDIR /workdir

COPY package.json .
COPY package-lock.json .

RUN npm install
COPY . .

RUN npm run build

FROM node:16-alpine

WORKDIR /app

COPY --from=build /workdir/node_modules .
COPY --from=build /workdir/dist .

EXPOSE 5003

CMD ["node", "dist/main.js"]
