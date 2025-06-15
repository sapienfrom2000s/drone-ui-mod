FROM node:14

WORKDIR /

ENV REACT_APP_DRONE_SERVER=https://drone.devops.peoplebox.ai
ENV REACT_APP_DRONE_TOKEN=NEGOp3UKXpUn2OcfRCg8HKNcOq8P2Mbj
ENV REACT_APP_BRANCHES_API=https://devprod.devops.peoplebox.ai/deployments

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001
CMD [ "npm", "run", "serve" ]
