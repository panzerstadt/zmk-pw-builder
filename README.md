# init, pull, deploy

```bash
# at repo root direcotry
git pull
git submodule update --init --recursive
gcloud auth login
# login to gcloud using deploy@polarityworks.com
gcloud config set run/region europe-north1
gcloud run deploy
# service name is zmk-pw-builder
# source is root directory
```

what you'll see is:

```
Deploying from source. To deploy a container use [--image]. See https://cloud.google.com/run/docs/deploying-source-code for more details.
Source code location (/Users/tliqun/Documents/Github-work/zmk-pw-builder):
Next time, use `gcloud run deploy --source .` to deploy the current directory.

Service name (zmk-pw-builder):
This command is equivalent to running `gcloud builds submit --tag [IMAGE] /Users/tliqun/Documents/Github-work/zmk-pw-builder` and `gcloud run deploy zmk-pw-builder --image [IMAGE]`

Building using Dockerfile and deploying container to Cloud Run service [zmk-pw-builder] in project [polarityworks] region [europe-north1]
⠛ Building and deploying... Building Container.
  ✓ Uploading sources...
  ⠛ Building Container... Logs are available at [https://console.cloud.google.com/cloud-build/
  builds/baabc825-0672-4185-bac1-959cfaa78505?project=152784376009].
  . Creating Revision...
  . Routing traffic...
```

# local test run

docker build -t zmknode .
docker run -p 8080:8080 --name zmkbuilder zmknode

# local enter docker and see see

docker exec -it zmkbuilder bash

# local stop

docker ps
docker stop zmkbuilder
docker rm zmkbuilder

run the above commands
go to localhost:8080
you should be able to see your docker building corne

# deploy

gcloud run deploy
pick europe-north1

# default configs for gcloud

gcloud config set run/region europe-north1

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

# ref

### this is for bt60 only so

#### the below builds bt60 to build/output folder, using /config's files.

#### config files will be supplied by the frontend

west build -d /build/output -s zmk/app -b bt60 -- -DZMK_CONFIG=/config

volumes: - ./zmk-build:/build/output/zephyr
