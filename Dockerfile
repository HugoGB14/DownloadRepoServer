FROM  node:22-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN mkdir download

EXPOSE 80
CMD [ "npm", "start" ]