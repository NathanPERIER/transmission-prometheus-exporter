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
    -v '/path/to/conf:/etc/transmission-exporter/:ro' \
    -e 'TRANSMISSION_EXPORTER_SERVER_NAME=...' \
    -e 'TRANSMISSION_EXPORTER_USERNAME=...' \
    -e 'TRANSMISSION_EXPORTER_PASSWORD_FILE=/etc/transmission-exporter/password' \
    -e 'TRANSMISSION_EXPORTER_SERVER_BASE_URL=...' \
    transmission-exporter:latest
```

> Note: the username and password can be omitted if the Transmission server doesn't use HTTP basic auth, and the latter can also directly be passed as an environment variable (see below)

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

## Dashboard integration

Enclosed with this repository is a [sample dashboard](grafana-dashboard.json) that uses most of the metrics from this exporter. Here is what it can look like :

![general section of the dashboard](images/grafana-1.png)

![blocking and result sections of the dashboard](images/grafana-2.png)

![resolving and caching sections of the dashboard](images/grafana-3.png)
