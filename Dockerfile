# Use the official Node.js 20 image as the base image for stability and security
FROM node:20-slim

# Set the working directory for the application inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker layer caching.
# This ensures dependencies are only re-installed if package files change.
COPY package*.json ./

# Install application dependencies using 'npm ci' for clean, locked installations.
# Use --omit=dev to keep the image small by excluding dev dependencies.
RUN npm ci --omit=dev

# Copy the core backend file into the WORKDIR
COPY server.js .

# Cloud Run services must listen on the port defined by the PORT environment variable.
# We expose port 8080 as this is the default for Google Cloud Run, though the PORT variable is preferred.
EXPOSE 8080

# Command to start the application
CMD ["node", "server.js"]