FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:18-alpine AS release

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production --frozen-lockfile

CMD ["yarn", "start"]