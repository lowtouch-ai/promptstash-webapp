# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - Node.js with nginx for running startup scripts
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

# Create nginx directories
RUN mkdir -p /run/nginx

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy scripts and dependencies for cache warming
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/scripts ./scripts
RUN mkdir -p /app/public

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Run entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
