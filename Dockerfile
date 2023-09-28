FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm i
COPY main.mjs .
CMD ["node","./main.mjs"]