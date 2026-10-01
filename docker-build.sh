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

PUBLIC_URL="$2"

# Derive Vite HMR WebSocket settings from the public URL. These are only used
# in dev mode when the dev server runs behind a TLS reverse proxy, so the
# browser can reach Vite's HMR WebSocket on the public host instead of
# localhost. See client/vite.config.mts and README.
#   https://host[:port]/path -> wss, port 443
#   http://host[:port]/path  -> ws,  port 80 (or the explicit port)
if [ -n "$PUBLIC_URL" ]; then
  # strip scheme
  URL_NO_SCHEME="${PUBLIC_URL#*://}"
  # host[:port] is everything before the first slash
  HOST_PORT="${URL_NO_SCHEME%%/*}"
  VITE_HMR_HOST="${HOST_PORT%%:*}"

  case "$PUBLIC_URL" in
    https://*)
      VITE_HMR_PROTOCOL='wss'
      DEFAULT_PORT=443
      ;;
    *)
      VITE_HMR_PROTOCOL='ws'
      DEFAULT_PORT=80
      ;;
  esac

  # explicit port in the URL (host:port) wins over the scheme default
  if [ "$HOST_PORT" != "$VITE_HMR_HOST" ]; then
    VITE_HMR_CLIENT_PORT="${HOST_PORT##*:}"
  else
    VITE_HMR_CLIENT_PORT="$DEFAULT_PORT"
  fi
fi

docker build \
  --build-arg PUBLIC_URL=$PUBLIC_URL \
  --build-arg NODE_ENV=$NODE_ENV \
  --build-arg VITE_HMR_HOST=$VITE_HMR_HOST \
  --build-arg VITE_HMR_PROTOCOL=$VITE_HMR_PROTOCOL \
  --build-arg VITE_HMR_CLIENT_PORT=$VITE_HMR_CLIENT_PORT \
  -t skarppi/logbook .
