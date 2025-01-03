FROM node:18-alpine

WORKDIR /home/app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./ 
RUN npm install

# Copy the rest of the source code
COPY . /home/app

# Expose the app's port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
