FROM node:8

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install
COPY . /usr/src/app

EXPOSE 80
ENTRYPOINT ["npm", "start"]