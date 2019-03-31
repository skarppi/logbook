FROM node:11-alpine

LABEL maintainer="juho.kolehmainen@iki.fi"

RUN mkdir -p /src

ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --frozen-lockfile
RUN cd /src && ln -s /tmp/node_modules

ADD . /src
WORKDIR /src

RUN ls -la

RUN PUBLIC_URL=/logbook yarn run build

EXPOSE 3000

ENV NODE_ENV production
CMD ["node", "dist/server/server/server.js"]
