FROM node:14.18.0-alpine As auth-dev

ENV SERVER_HOME=/usr/src/app
WORKDIR $SERVER_HOME

COPY package*.json ./

# Install dependencies
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm install

COPY . .

RUN npm i -g rimraf
RUN npm run build

FROM node:14.18.0-alpine as auth-prod

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]