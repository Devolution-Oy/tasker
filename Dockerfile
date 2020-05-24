FROM node:13.10

ENV NODE_ENV=$NODE_ENV
ENV APP_ID=$APP_ID 
ENV WEBHOOK_SECRET=$WEBHOOK_SECRET
ENV ROSTER_URL=$ROSTER_URL
ENV CI=$CI
RUN mkdir /usr/src/app
RUN ls -la $GITHUB_WORKSPACE
COPY $GITHUB_WORKSPACE /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install
RUN echo $PWD
RUN ls -la

EXPOSE 80
ENTRYPOINT ["npm", "start"]