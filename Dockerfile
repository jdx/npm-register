FROM alpine:3.7
MAINTAINER Jeff Dickey

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
        register \
    && mkdir -p /srv/npm-register/src /srv/npm-register/data \
    && chown -R register:register /srv/npm-register \
    && chmod -R g+w /srv/npm-register

# Deploy application
COPY . /srv/npm-register/src
WORKDIR /srv/npm-register/src
RUN npm install \
    && chown -R register:register .

# Share storage volume
ENV NPM_REGISTER_FS_DIRECTORY /srv/npm-register/data
VOLUME /srv/npm-register/data

# Start application
EXPOSE 3000
USER register
ENV NODE_ENV production
CMD ["npm", "start"]

