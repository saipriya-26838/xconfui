# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies and fix vulnerabilities
RUN npm install && npm audit fix

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 9393

# Command to run the application
CMD ["npm", "start"]
