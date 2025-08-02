# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Starting Beasiswa Scraper Application..."\n\
\n\
# Start scheduler service in background\n\
node scheduler-server-working.js &\n\
SCHEDULER_PID=$!\n\
\n\
# Start Next.js application\n\
npm start &\n\
NEXT_PID=$!\n\
\n\
# Wait for both processes\n\
wait $SCHEDULER_PID $NEXT_PID\n\
' > /app/start.sh && chmod +x /app/start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV SCHEDULER_PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/beasiswa || exit 1

# Start application
CMD ["/app/start.sh"] 