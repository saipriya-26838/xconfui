# Use an official Node.js runtime as a parent image (lightweight alpine-based)
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install application dependencies and fix vulnerabilities
RUN npm install && npm audit fix

# Copy the configuration file into the container (make sure the path is correct)
COPY config/sample_xconfui.conf /usr/src/app/config/sample_xconfui.conf

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 9393

# Set environment variable for the configuration file path
ENV CONFIG_PATH=/usr/src/app/config/sample_xconfui.conf

# Command to run the application
CMD ["npm", "start"]

#------------------------V1----------------------------
## Use an official Node.js runtime as a parent image
#FROM node:14-alpine
#
## Set the working directory in the container
#WORKDIR /usr/src/app
#
## Copy package.json and package-lock.json to the working directory
#COPY package*.json ./
#
## Install dependencies and fix vulnerabilities
#RUN npm install && npm audit fix
#
## Copy the rest of the application code
#COPY . .
#
## Expose the port that the app runs on
#EXPOSE 9393
#
## Command to run the application
#CMD ["npm", "start"]
