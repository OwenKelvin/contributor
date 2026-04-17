FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

ENV PORT=3000

WORKDIR /app

COPY dist/apps/admin .

EXPOSE 3000

CMD [ "node", "server/server.mjs" ]
