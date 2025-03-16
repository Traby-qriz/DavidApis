FROM node:20-alpine

# Set timezone
ENV TZ=Africa/Nairobi

# Install necessary dependencies
RUN apk add --no-cache \
    tzdata \
    ffmpeg \
    imagemagick \
    python3 \
    py3-pip \
    graphicsmagick \
    sudo \
    npm \
    yarn \
    bash \
    g++ \
    make \
    sqlite-dev \
    libffi-dev && \
    cp /usr/share/zoneinfo/Africa/Nairobi /etc/localtime && \
    echo "Africa/Nairobi" > /etc/timezone

# Install global npm packages
RUN npm install -g supervisor

# Remove unnecessary files to keep the image lightweight
RUN rm -rf /var/cache/apk/*

# Set working directory and copy application files
WORKDIR /app
COPY . .

# Install application dependencies
RUN yarn install --network-concurrency 1 --verbose

# Specify the command to run the application
CMD ["node", "index.js"]