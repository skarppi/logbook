#!/bin/bash

docker stop logbook

docker rm logbook

docker run --name=logbook -p 3000:3000 -e DB_HOST=`whoami`@docker.for.mac.host.internal \
    -v /etc/localtime:/etc/localtime \
    -v ${PWD}/LOGS:/src/LOGS \
    -v ${PWD}/VIDEOS:/src/VIDEOS \
    -d skarppi/logbook
