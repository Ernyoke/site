FROM node:8-alpine
RUN mkdir -p /usr/src/app && npm install http-server -g
ADD ./dist/ /usr/src/app
WORKDIR /usr/src/app
EXPOSE 8080
CMD ["http-server", "/usr/src/app"]
