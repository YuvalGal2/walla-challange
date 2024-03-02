# Use Node.js 14 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000 for NestJS application
EXPOSE 3000

# Command to run the NestJS application
CMD ["npm", "run", "start:prod"]
