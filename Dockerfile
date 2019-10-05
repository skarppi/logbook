FROM node:11-alpine

LABEL maintainer="juho.kolehmainen@iki.fi"

WORKDIR /app

ADD package*.json /app/
RUN npm install

ADD server/package*.json /app/server/
ADD client/package*.json /app/client/
RUN npm run install

ADD /shared /app/shared
ADD /server/src /app/server/src
ADD /client/src /app/client/src
ADD /client/webpack.config.js /app/client

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

# start or start:prod
ARG SCRIPT=start
ENV SCRIPT=$SCRIPT

RUN if [ "$SCRIPT" = 'start:prod' ] ; then PUBLIC_URL=$PUBLIC_URL npm run build; else echo '---DEV MODE---'; fi

EXPOSE 3000

CMD ["/bin/sh", "-c", "npm ${SCRIPT}"]