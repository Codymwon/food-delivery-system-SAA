FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start API Gateway
CMD ["npm", "start"]
