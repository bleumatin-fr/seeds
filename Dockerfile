# FROM node:18.18.2 AS build
FROM node:20.9.0 AS build
ENV YARN_VERSION 1.22.19
ENV NODE_ENV=development

RUN apt-get update
ADD . /tmp/build
WORKDIR /tmp/build
RUN yarn clean
RUN yarn global add node-gyp
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production
RUN yarn build

# FROM node:18.18.2-alpine
FROM ghcr.io/puppeteer/puppeteer:22.6.0

WORKDIR /app

COPY --from=build /tmp/build/packages/server/dist /app

COPY --from=build /tmp/build/packages/admin/dist /app/admin
COPY --from=build /tmp/build/packages/client/dist /app/client
RUN yarn install --production --frozen-lockfile

COPY --from=build /tmp/build/packages/core/dist /app/node_modules/@arviva/core

ENV ADMIN_PATH=/app/admin
ENV CLIENT_PATH=/app/client
ENV NODE_ENV=production
CMD ["node", "src/app.js"]