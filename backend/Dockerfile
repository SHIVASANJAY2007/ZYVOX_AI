# Use Node.js LTS alpine base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install package dependencies
RUN npm install --omit=dev

# Copy all backend source code
COPY . .

# Expose port 5000 for the Express server
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
