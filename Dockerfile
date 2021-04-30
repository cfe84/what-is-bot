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
EXPOSE 8000
ENV port=8000
ENV PORT=8000
COPY definitions.json /app/
ENTRYPOINT node /app/application/index.js