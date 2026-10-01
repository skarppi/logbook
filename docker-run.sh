#!/bin/bash

docker stop logbook

docker rm logbook

# Database credentials. Override by exporting these before running the script.
# DB_HOST must be a bare hostname/IP only - the server builds the connection
# string as postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME, so putting
# credentials in DB_HOST produces a malformed URL and auth failures.
DB_USER="${DB_USER:-logbook}"
DB_PASSWORD="${DB_PASSWORD:-logbook}"
DB_NAME="${DB_NAME:-logbook}"

OPTS=""
if [ `uname` = "Darwin" ]; then
    DB_HOST="${DB_HOST:-docker.for.mac.host.internal}"
else
    echo `uname`
    DB_HOST="${DB_HOST:-127.0.0.1}"
    OPTS="--net=host -v /etc/localtime:/etc/localtime"
fi

docker run --name=logbook -p 3000:3000  -p 3001:3001 \
    --restart always \
    -e DB_HOST=$DB_HOST \
    -e DB_USER=$DB_USER \
    -e DB_PASSWORD=$DB_PASSWORD \
    -e DB_NAME=$DB_NAME \
    $OPTS \
    -v ${PWD}/LOGS:/app/server/LOGS \
    -v ${PWD}/VIDEOS:/app/server/VIDEOS \
    -v ${PWD}/server/src:/app/server/src \
    -v ${PWD}/client/src:/app/client/src \
    -d skarppi/logbook
