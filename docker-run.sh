#!/bin/bash

docker stop logbook

docker rm logbook

docker run --name=logbook -p 3000:3000 -e DB_HOST=logbook:logbook@127.0.0.1 --net=host \
    -e NODE_ENV=production \
    -v /etc/localtime:/etc/localtime \
    -v ${PWD}/LOGS:/src/LOGS \
    -v ${PWD}/VIDEOS:/src/VIDEOS \
    -d skarppi/logbook
    # set path other than root
    # -e PUBLIC_URL=/logbook
