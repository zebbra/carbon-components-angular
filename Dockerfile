FROM node:14.17

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 6006

CMD ["npm", "run", "storybook"]
