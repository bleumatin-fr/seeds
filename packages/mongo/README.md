# Mongo

## Local Installation

Setup
- [Installing MongoDB on Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
- [Installing MongoDB on Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)

MongoDB is expected to listen on localhost:27017.

## Docker

Setup
```ini
# packages/mongo/.env.local
MONGO_ON_DOCKER=true
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
```
