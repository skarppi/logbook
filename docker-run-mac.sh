#!/bin/bash

docker stop logbook

docker rm logbook

docker run --name=logbook -p 3000:3000 -e DB_HOST=`whoami`@docker.for.mac.host.internal \
    -v ${PWD}/LOGS:/app/LOGS \
    -v ${PWD}/VIDEOS:/app/VIDEOS \
    -v ${PWD}/shared:/app/shared \
    -v ${PWD}/server/src:/app/server/src \
    -v ${PWD}/client/src:/app/client/src \
    -d skarppi/logbook
