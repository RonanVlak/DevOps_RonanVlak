FROM node:18.16.0-alpine
WORKDIR /app

# kopieer package eerst voor layer-caching
COPY package*.json ./
RUN npm install

# kopieer de code
COPY . .

# default environment variables
ENV PORT=12345
ENV MONGO_URL=mongodb://admin:secret@devops-mongo:27017/mydb?authSource=admin

EXPOSE 12345
CMD ["npm", "start"]