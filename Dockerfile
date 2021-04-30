FROM node:14-alpine as nodebuild
WORKDIR /app
COPY . .
RUN npm install && \
    npm run build && \
    npm run test

FROM node:14-alpine as noderun
WORKDIR /app
COPY --from=nodebuild /app/dist/ ./
COPY package*.json ./
RUN npm install --only=prod
# TODO: change port if necessary
EXPOSE 8000
# TODO: add ENV if necessary
ENV port=8000
ENV PORT=8000
COPY definitions.json ./
ENTRYPOINT node /app/application/index.js