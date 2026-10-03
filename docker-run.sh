#!/bin/bash

docker stop logbook

docker rm logbook

# Run mode: must match how the image was built with docker-build.sh.
#   production (default) -> runs the compiled server, no source bind-mounts
#   dev                  -> runs the dev servers and bind-mounts source for live reload
MODE="${1:-production}"

# Database credentials. Override by exporting these before running the script.
# DB_HOST must be a bare hostname/IP only - the server builds the connection
# string as postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME, so putting
# credentials in DB_HOST produces a malformed URL and auth failures.
DB_USER="${DB_USER:-logbook}"
DB_PASSWORD="${DB_PASSWORD:-logbook}"
DB_NAME="${DB_NAME:-logbook}"
# Set to 'true' when Postgres requires SSL (ssl = on + hostssl in pg_hba.conf).
DB_SSL="${DB_SSL:-false}"

OPTS=""
if [ `uname` = "Darwin" ]; then
    DB_HOST="${DB_HOST:-docker.for.mac.host.internal}"
else
    echo `uname`
    DB_HOST="${DB_HOST:-127.0.0.1}"
    OPTS="--net=host -v /etc/localtime:/etc/localtime"
fi

# Only bind-mount source (for live reload) in dev mode. In production the
# container runs the compiled artifacts baked into the image.
if [ "$MODE" = "dev" ]; then
    OPTS="$OPTS -v ${PWD}/server/src:/app/server/src -v ${PWD}/client/src:/app/client/src"
fi

docker run --name=logbook -p 3000:3000  -p 3001:3001 \
    --restart always \
    -e DB_HOST=$DB_HOST \
    -e DB_USER=$DB_USER \
    -e DB_PASSWORD=$DB_PASSWORD \
    -e DB_NAME=$DB_NAME \
    -e DB_SSL=$DB_SSL \
    $OPTS \
    -v ${PWD}/LOGS:/app/server/LOGS \
    -v ${PWD}/VIDEOS:/app/server/VIDEOS \
    -d skarppi/logbook
