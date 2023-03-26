
# This dockerfile essentially:
# gets the latest zmk, installs west and zephyr
# piles node on top of that
# then runs a node server using the built zmk

# Stage 1: Install west and zephyr.
FROM zmkfirmware/zmk-build-arm:stable as zmk-west
WORKDIR /
COPY /config /config
RUN ["west", "init", "-l", "config"]
RUN ["west", "update"]
RUN ["west", "zephyr-export"]

# Stage 2: Install node on top of stage 1's zmk
FROM zmk-west as zmk-node
ENV NODE_VERSION=16.13.0
RUN apt-get update && apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Stage 3: Build the ZMK firmware on top of stage 2's node
# Stage 3.1: copy files from zmk-west's zmk image to the zmk-node image
FROM zmk-node
COPY --from=zmk-west /zmk/app /zmk/app
COPY . .
# Stage 3.2: install server dependencies
WORKDIR /server
RUN npm install
WORKDIR /
EXPOSE 8080
# Stage 3.3: run server
CMD ["node", "server/index.js"]
# CMD ["west", "build", "-d", "/build/output", "-s", "zmk/app", "-b", "nice_nano_v2", "--", "-DSHIELD=corne_left", "-DZMK_CONFIG=/config"]

