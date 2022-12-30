FROM node:19-alpine as builder

WORKDIR /app

COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN yarn --immutable

COPY /server ./server
COPY /client ./client

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

# dev or prod
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = 'production' ] ; then PUBLIC_URL=$PUBLIC_URL yarn build; else echo '---DEV MODE---'; fi

RUN yarn rebuild

FROM node:19-alpine as runner

WORKDIR /app

COPY --from=builder /app/ ./

EXPOSE 3000

CMD ["yarn", "dev"]