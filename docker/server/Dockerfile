from node as base

workdir /usr/src/app

from base as builder
copy package*.json .

run npm ci

copy . .

run npm run build:server

from base

copy package*.json .

env NODE_ENV=production
run npm ci

copy --from=builder /usr/src/app/build/server/ .
copy config config
copy migrations migrations
copy knexfile.js .
copy start-server.sh .

entrypoint /usr/src/app/start-server.sh
