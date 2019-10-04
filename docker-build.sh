#!/bin/bash

if [ "$1" = 'prod' ] ; then 
  SCRIPT='start:prod';
elif [ "$1" = 'dev' ]; then
  SCRIPT='start';
else
  echo 'Usage: ./docker-build.sh [dev/prod]'
  echo "Unknown argument: $1"
  exit 1;
fi;

docker build \
  --build-arg PUBLIC_URL= \
  --build-arg SCRIPT=$SCRIPT \
  -t skarppi/logbook . 