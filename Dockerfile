FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install


COPY . .

ARG PORT=8000
ENV PORT=$PORT
ENV NODE_ENV=production

EXPOSE $PORT

CMD ["npm", "start"]