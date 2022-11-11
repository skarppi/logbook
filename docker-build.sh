#!/bin/bash

if [ "$1" = 'production' ] ; then 
  NODE_ENV='production';
elif [ "$1" = 'dev' ]; then
  NODE_ENV='dev';
elif [ -z "$2"]; then
  echo 'Usage: ./docker-build.sh [dev/production] http://hostname:port/path'
  echo "Unknown or missing arguments: $1 $2"
  exit 1;
fi;

docker build \
  --build-arg PUBLIC_URL=$2 \
  --build-arg NODE_ENV=$NODE_ENV \
  -t skarppi/logbook . 