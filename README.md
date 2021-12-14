# local test run

docker build -t zmknode .
docker run -p 8080:8080 --name zmkbuilder zmknode


# local enter docker and see see
docker exec -it zmkbuilder bash

# local stop

docker ps
docker stop zmkbuilder


run the above commands
go to localhost:8080
you should be able to see your docker building corne


# deploy
gcloud run deploy


# ref

basically what i need to run is to initialize west
- a container with zmk-build-arm -> save to cloud registry
- CMD will pass it all the required arguments and just run west build

while running
- run CMD
to update
- rebuild container an version up

FROM zmkfirmware/zmk-build-arm:2.5
COPY . .
RUN ["west", "init", "-l", "config"] --> check if this config only requires west.yml or other stuff (most probably just west.yml)
RUN ["west", "update"]
RUN ["west", "zephyr-export"]



and then: https://docs.zephyrproject.org/latest/guides/west/build-flash-debug.html#west-building

FROM docker-zmk
# these settings are per-device
CMD ["west", "build", "-d", "/build/output", "-s", "zmk/app", "-b", "nice_nano_v2", "--", "-DSHIELD=corne_left", "-DZMK_CONFIG=/config"]

# this is for bt60 only so
# the below builds bt60 to build/output folder, using /config's files.
# config files will be supplied by the frontend
west build -d /build/output -s zmk/app -b bt60 -- -DZMK_CONFIG=/config

volumes:
      - ./zmk-build:/build/output/zephyr