FROM  node:alpine
WORKDIR /app

COPY package*.json ./
COPY server.js ./

RUN npm install

COPY . .

EXPOSE 3000 1935 1200

CMD [ "node", "server.js" ]
