# Use an official Node.js runtime as the base image
FROM node:21

# Install Python and other necessary packages
RUN apt-get update && apt-get install -y python3 make g++ libxi-dev libx11-dev libgl1-mesa-dev && ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Make port 3000 available outside the container
EXPOSE 3000

# Run the application when the container launches
CMD ["node", "src/app.js"]