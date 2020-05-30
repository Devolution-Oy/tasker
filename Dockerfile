FROM node:13.10

USER node
# Replace the args with buildarg
ENV NODE_ENV production
RUN mkdir /home/node/app
COPY --chown=node:node package.json /home/node/app/
COPY --chown=node:node package-lock.json /home/node/app/
COPY --chown=node:node *.js /home/node/app/
WORKDIR /home/node/app
ENV PATH /home/node/app/node_modules/.bin:$PATH
RUN npm install

EXPOSE 8080
ENTRYPOINT ["npm", "start"]