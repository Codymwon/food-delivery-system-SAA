FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose microservice port
EXPOSE 5006

# Start Delivery Service
CMD ["npm", "start"]
