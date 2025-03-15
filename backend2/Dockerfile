FROM --platform=linux/amd64 node:18-slim

WORKDIR /app

# Install minimal required dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 

COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm cache clean --force && \
    npm uninstall @img/sharp-darwin-arm64 graphql-iso-date && \
    npm install --legacy-peer-deps && \
    npm rebuild sharp

COPY . .

EXPOSE 4001

# Make sure your app binds to 0.0.0.0
ENV HOST=0.0.0.0
ENV PORT=4001

CMD ["npm", "start"]