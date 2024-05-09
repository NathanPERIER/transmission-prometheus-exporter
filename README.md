# Transmission Prometheus Exporter

## Run with Docker (recommended)

Build the container :

```bash
docker build . -t transmission-exporter
```

Run the image :

```bash
docker run --name transmission-exporter \
    -p 8080:8080 \
    -e 'TRANSMISSION_EXPORTER_SERVER_NAME=...' \
    -e 'TRANSMISSION_EXPORTER_USERNAME=...' \
    -e 'TRANSMISSION_EXPORTER_PASSWORD=...' \
    -e 'TRANSMISSION_EXPORTER_SERVER_BASE_URL=...' \
    transmission-exporter:latest
```

## Run with NodeJS (dev)

> Note: so far, this has only be tested with node 18

First, we install the dependencies :

```bash
npm install
```

Then, we set the variables and run the exporter :

```bash
export 'TRANSMISSION_EXPORTER_SERVER_NAME=...'
export 'TRANSMISSION_EXPORTER_USERNAME=...'
export 'TRANSMISSION_EXPORTER_PASSWORD=...'
export 'TRANSMISSION_EXPORTER_SERVER_BASE_URL=...'
npm run dev
```