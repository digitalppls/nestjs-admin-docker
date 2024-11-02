# INSTALL
FROM node:22-alpine AS installer
WORKDIR /temp
COPY package.json .
COPY pnpm-lock.yaml .
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile

# BUILD
FROM node:22-alpine AS build
WORKDIR /adminjs/dist
COPY --from=installer /temp/. /adminjs/.
COPY . /adminjs/.
RUN cd /adminjs 
RUN npm run build