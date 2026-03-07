# Backend Dockerfile
FROM node:18-slim

# Install system dependencies for canvas and puppeteer
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./backend/

# Install dependencies for backend
WORKDIR /app/backend
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the backend code and shared code
WORKDIR /app
COPY backend ./backend
COPY shared ./shared

# Build the application
WORKDIR /app/backend
RUN npm run build

# Expose the backend port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
