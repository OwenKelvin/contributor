FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000


WORKDIR /app

COPY dist/apps/backend/package.json ./package.json

RUN npm i -g pnpm

RUN pnpm install

COPY apps/backend ./apps/backend/

RUN pnpm install

RUN pnpm i -D sequelize-cli@6.6.5

RUN pnpm i -D nx@22.3.3

COPY dist/apps/backend .

CMD ["sh", "-c", "pnpm db:migrate && node main.js"]
