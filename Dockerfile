# Stage 1
FROM node:18-alpine AS build
WORKDIR /api

COPY src src
COPY package.json .
COPY package-lock.json .
RUN npm install
RUN npm run build

# Stage 2
FROM node:18-alpine AS prod
COPY --from=build /api/build ./build
COPY --from=build /api/node_modules ./node_modules

EXPOSE 3000
