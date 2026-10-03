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

# NODE_ENV decides how the container starts: production runs the compiled
# server (serving the built client bundle), anything else runs the dev servers.
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Vite HMR WebSocket settings for dev mode behind a reverse proxy.
# Consumed by client/vite.config.mts at dev-server runtime (pnpm dev).
ARG VITE_HMR_HOST
ARG VITE_HMR_PROTOCOL
ARG VITE_HMR_CLIENT_PORT
ENV VITE_HMR_HOST=$VITE_HMR_HOST
ENV VITE_HMR_PROTOCOL=$VITE_HMR_PROTOCOL
ENV VITE_HMR_CLIENT_PORT=$VITE_HMR_CLIENT_PORT

EXPOSE 3000

# In production serve the compiled server on port 3000; otherwise start the
# dev servers with live reload.
CMD if [ "$NODE_ENV" = "production" ]; then \
      PORT=3000 node ./server/dist/server/src/server.js; \
    else \
      pnpm dev; \
    fi
