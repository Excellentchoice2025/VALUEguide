FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Create the generated directory
RUN mkdir -p public/generated && chmod -R 777 public/generated

EXPOSE 3000

CMD ["node", "server.js"]