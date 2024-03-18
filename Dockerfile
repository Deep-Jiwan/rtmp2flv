FROM  node:alpine
WORKDIR /app

COPY package*.json ./
COPY server.js ./

RUN npm install

COPY . .

EXPOSE 80 1935 8000

CMD [ "node", "server.js" ]
