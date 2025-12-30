FROM node:20-slim

# Install Chromium dependencies for Remotion
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Remotion
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy from subdirectory
COPY video-studio-server/package*.json ./
RUN npm install

COPY video-studio-server/ .

# Create videos directory
RUN mkdir -p videos

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
