FROM node:13.10

USER node
# Replace the args with buildarg
ARG BA_APP_ID=123456
ARG BA_WEBHOOK_SECRET=123456
ENV BA_ROSTER_URL=localhost
ENV NODE_ENV=production
ENV APP_ID=${BA_APP_ID}
ENV WEBHOOK_SECRET=${BA_WEBHOOK_SECRET}
ENV ROSTER_URL=${BA_ROSTER_URL}
RUN whoami 
RUN echo $ROSTER_URL
RUN mkdir /home/node/app
COPY --chown=node:node package.json /home/node/app/
COPY --chown=node:node package-lock.json /home/node/app/
COPY --chown=node:node index.js /home/node/app
WORKDIR /home/node/app
ENV PATH /home/node/app/node_modules/.bin:$PATH
RUN npm install
RUN echo $PWD
RUN ls -la

EXPOSE 80
ENTRYPOINT ["npm", "start"]