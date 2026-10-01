FROM node:22-alpine AS builder

# Enable pnpm via corepack (bundled with Node 16+)
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile

COPY /server ./server
COPY /client ./client

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

# dev or prod
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = 'production' ] ; then PUBLIC_URL=$PUBLIC_URL pnpm build; else echo '---DEV MODE---'; fi

FROM node:22-alpine AS runner

RUN corepack enable

WORKDIR /app

COPY --from=builder /app/ ./

EXPOSE 3000

CMD ["pnpm", "dev"]
