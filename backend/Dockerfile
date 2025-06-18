FROM node:18

# Instalare mongodump (MongoDB Tools)
RUN apt-get update && apt-get install -y gnupg curl && \
  curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg && \
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
  apt-get update && apt-get install -y mongodb-database-tools && \
  apt-get clean

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "go"]
