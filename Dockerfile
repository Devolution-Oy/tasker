FROM node:13.10

ENV NODE_ENV=${NODE_ENV}
ENV APP_ID=${APP_ID}
ENV WEBHOOK_SECRET=${WEBHOOK_SECRET}
ENV ROSTER_URL=${ROSTER_URL}
ENV CI=${CI}
RUN echo $WHOAMI
RUN echo $ROSTER_URL
RUN mkdir /home/node/app
COPY package.json /home/node/app/
COPY package-lock.json /home/node/app/
WORKDIR /home/node/app
ENV PATH /home/node/app/node_modules/.bin:$PATH
RUN npm install
RUN echo $PWD
RUN ls -la

EXPOSE 80
ENTRYPOINT ["npm", "start"]