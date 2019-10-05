#!/bin/bash

if [ "$1" = 'prod' ] ; then 
  SCRIPT='start:prod';
elif [ "$1" = 'dev' ]; then
  SCRIPT='start';
elif [ -z "$2"]; then
  echo 'Usage: ./docker-build.sh [dev/prod] http://hostname:port/path'
  echo "Unknown or missing arguments: $1 $2"
  exit 1;
fi;

docker build \
  --build-arg PUBLIC_URL=$2 \
  --build-arg SCRIPT=$SCRIPT \
  -t skarppi/logbook . 