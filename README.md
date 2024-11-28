# SEEDS - ARVIVA

## Prerequisites

- node v20
- [mongo](./packages/mongo/README.md)
- [redis](./packages/redis/README.md)
- [onlyoffice documentserver](./packages/documentserver/README.md)

## Install

```
yarn install

## to clean all installed node_modules
yarn clean
```

## Develop

```
yarn start
```
- API : http://localhost:3000
- Public front-end : http://localhost:4001
- Admin : http://localhost:4002

## Migrations

### Create a migration

```
yarn run migration:create
# rename and fill new file created in packages/server/migrations
```

### Migrate database

Migrations run automatically when server starts.

You can also run them manually:

```
yarn run migration:up
```

## Deploy

Through github actions