FROM zmkfirmware/zmk-build-arm:2.5 as zmk-west
WORKDIR /west
COPY /west .
RUN ["west", "init", "-l", "init"]
RUN ["west", "update"]
RUN ["west", "zephyr-export"]

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

FROM zmk-node
COPY --from=zmk-west /west/zmk/app /zmk/app
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
# CMD ["west", "build", "-d", "/build/output", "-s", "zmk/app", "-b", "nice_nano_v2", "--", "-DSHIELD=corne_left", "-DZMK_CONFIG=/config"]
