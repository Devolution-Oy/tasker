FROM node:13.10

USER node
# Replace the args with buildarg
ENV NODE_ENV production
RUN mkdir /home/node/app
RUN mkdir /home/node/app/utils
COPY --chown=node:node package.json /home/node/app/
COPY --chown=node:node package-lock.json /home/node/app/
COPY --chown=node:node *.js /home/node/app/
COPY --chown=node:node utils/*.js /home/node/app/utils/
WORKDIR /home/node/app
ENV PATH /home/node/app/node_modules/.bin:$PATH
RUN npm install

EXPOSE 8080
ENTRYPOINT ["npm", "start"]