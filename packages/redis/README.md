# REDIS

## Local Installation

Setup

- [Installing Redis on Linux](https://redis.io/docs/install/install-redis/install-redis-on-linux/)
- [Installing Redis on Windows](https://redis.io/docs/install/install-redis/install-redis-on-windows/)

Redis is expected to listen on localhost:6379.

## Docker

Setup

```ini
# packages/documentserver/.env.local
REDIS_ON_DOCKER=true

# packages/server/.env.local
#  This is the URL of our API from the point of view
#  of the docker container running only office document
#  server
REDIS_URL=http://172.17.0.1:6379/admin/api
```
