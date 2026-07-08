# Stage 1: Server build
FROM node:22-alpine AS server

RUN apk -U upgrade \
  && apk add build-base python3 --no-cache

WORKDIR /app

COPY server ./server

WORKDIR /app/server

RUN npm install \
  && npm run build \
  && npm prune --production

# Stage 2: Client build
FROM node:22 AS client

WORKDIR /app

COPY client ./client

WORKDIR /app/client

RUN npm install npm --global \
  && npm install --omit=dev \
  && INDEX_FORMAT=ejs DISABLE_ESLINT_PLUGIN=true npm run build

# Stage 3: Final image
FROM node:22-alpine

RUN apk -U upgrade \
  && apk add bash python3 squid --no-cache

USER node
WORKDIR /app

# Root project files
COPY --chown=node:node LICENSE.md .
COPY --chown=node:node server/.env.sample .
COPY --chown=node:node server/requirements.txt .
COPY --chown=node:node server/healthcheck.js .
COPY --chown=node:node server/start.sh .

# License directory
COPY --chown=node:node LICENSES ./LICENSES

# Server build output
COPY --from=server --chown=node:node /app/server/node_modules ./node_modules
COPY --from=server --chown=node:node /app/server/dist .

# Client build output
COPY --from=client --chown=node:node /app/client/dist ./public

RUN sed -i 's/\r$//' start.sh \
  && chmod +x start.sh \
  && python3 -m venv .venv \
  && .venv/bin/pip3 install --upgrade pip \
  && .venv/bin/pip3 install -r requirements.txt --no-cache-dir \
  && mv .env.sample .env \
  && mv public/index.ejs views \
  && npm config set update-notifier false

VOLUME /app/data

EXPOSE 1337

HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \
  CMD node ./healthcheck.js

CMD ["/bin/bash", "./start.sh"]
