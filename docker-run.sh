#!/bin/bash

docker stop logbook

docker rm logbook

OPTS=""
if [ `uname` = "Darwin" ]; then
    DB_HOST=`whoami`@docker.for.mac.host.internal
else
    echo `uname`
    DB_HOST="logbook:logbook@127.0.0.1"
    OPTS="--net=host -v /etc/localtime:/etc/localtime"
fi

docker run --name=logbook -p 3000:3000  -p 3001:3001 \
    --restart always \
    -e DB_HOST=$DB_HOST \
    $OPTS \
    -v ${PWD}/LOGS:/app/server/LOGS \
    -v ${PWD}/VIDEOS:/app/server/VIDEOS \
    -v ${PWD}/shared:/app/shared \
    -v ${PWD}/server/src:/app/server/src \
    -v ${PWD}/client/src:/app/client/src \
    -v ${PWD}/client/webpack.config.js:/app/client/webpack.config.js \
    -d skarppi/logbook
