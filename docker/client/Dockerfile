from node as base

workdir /usr/src/app

from base as builder
copy package*.json .

run npm ci

copy . .

run npm run build:client

from nginx

copy --from=builder /usr/src/app/build/client/ /usr/share/nginx/html/
copy default.conf.template /etc/nginx/templates/
