# OnlyOffice Document Server


## Local Installation

Setup
- [Installing ONLYOFFICE Document Server Linux version](https://helpcenter.onlyoffice.com/installation/docs-community-install-ubuntu.aspx)
- [Installing ONLYOFFICE Document Server Windows version](https://helpcenter.onlyoffice.com/installation/docs-community-install-windows.aspx)

OnlyOffice Document Server is expected to listen on localhost:4003.

## Docker

Setup
```ini
# packages/documentserver/.env.local
DOCUMENTSERVER_ON_DOCKER=true

# packages/server/.env.local
#  This is the URL of our API from the point of view
#  of the docker container running only office document
#  server
DOCUMENTSERVER_API_URL=http://172.17.0.1:3000/admin/api
```

/usr/bin/documentserver-generate-allfonts.sh