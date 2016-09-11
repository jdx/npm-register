FROM alpine:3.4
MAINTAINER Jeff Dickey <dickeyxxx@gmail.com>

# Install NodeJS and node-gyp deps
RUN apk --no-cache add \
        g++ \
        gcc \
        make \
        bash \
        gnupg \
        paxctl \
        python \
        nodejs \
        linux-headers

# Create user and group
RUN addgroup -S register \
    && adduser -D -S \
        -s /bin/bash \
        -h /srv/npm-register \
        -G register \
        register

# Deploy application
COPY . /srv/npm-register
WORKDIR /srv/npm-register
RUN npm install \
    && chown -R register:register .

# Share storage volume
ENV NPM_REGISTER_FS_DIRECTORY /data
VOLUME /data

# Start application
EXPOSE 3000
USER register
ENV NODE_ENV production
CMD ["npm", "start"]

