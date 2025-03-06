# rtmp2flv

A Node.js application that listens for an RTMP stream and publishes it on a webpage using supported HTTP-FLV. This project is optimized for low latency, minimal resource usage, and is Docker-friendly. It provides an easy-to-setup solution for streaming with support for multiple cameras.

---

## Features

- **Low Latency:** Real-time streaming optimized for speed.
- **Low Spec Requirements:** Designed to run on minimal hardware.
- **Docker Friendly:** Easy deployment with Docker.
- **Easy Setup:** Straightforward configuration for both local and production environments.
- **Multiple Camera Support:** Toggle between various camera streams via the player interface.

---

## Configuration

### Environment Variables

Update your environment configuration by creating a `.env` file (or duplicating the provided `.env.template`) with the following variables:

- **STREAM\_IP:** The IP address from which the RTMP stream is coming.\
  *Example:* `localhost` (if the stream is on the same machine)
- **INTERNAL\_STREAM\_PORT:** The port where the FLV stream is hosted. This port is used for playback in `player.html` or in VLC.\
  *Example:* `1200`
- **EXPOSED\_IP:** The IP (and port) where the Express server is hosted when using the proxy. This is the address that clients will use to connect.\
  *Example:* `localhost:3000`
- **MAIN\_PORT:** The port on which the Express server listens.\
  *Example:* `3000`

### Streaming Settings

Configure your streaming settings (for example, in your OBS or FFMPEG) as follows:

```json
{
  "server": "rtmp://STREAM_IP/live",
  "streamkey": "livestream"
}
```

---

## Usage Details

### Local Development

#### Clone the Repository:

```bash
git clone https://github.com/Deep-Jiwan/rtmp2flv.git
```

#### Setup Environment Variables:

Duplicate the `.env.template` file and rename it to `.env`. Update the `.env` file with the following (or as applicable)

```ini
STREAM_IP=localhost
INTERNAL_STREAM_PORT=1200
EXPOSED_IP=localhost:3000
MAIN_PORT=3000
```

#### Run the Server:

```bash
node server.js
```

#### Test the Application:

- **Raw FLV Stream:** [http://localhost:1200/live/livestream.flv](http://localhost:1200/live/livestream.flv)
- **Proxy Stream:** [http://localhost:3000/proxy](http://localhost:3000/proxy)
- **Player Interface:** [http://localhost:3000/player](http://localhost:3000/player)

---

## Docker Deployment

### Pull the Latest Docker Image:

```bash
docker pull ghcr.io/deep-jiwan/rtmp2flv:latest
```

### Run the Docker Container:

Ensure you map the necessary ports and set the correct environment variables:

```bash
docker run -d \
  -p 1935:1935 \
  -p 1200:1200 \
  -p 3000:3000 \
  -e STREAM_IP=localhost \
  -e INTERNAL_STREAM_PORT=1200 \
  -e EXPOSED_IP=localhost:3000 \
  -e MAIN_PORT=3000 \
  ghcr.io/deep-jiwan/rtmp2flv:latest
```

#### Test the Application:

- **Raw FLV Stream:** [http://localhost:1200/live/livestream.flv](http://localhost:1200/live/livestream.flv)
- **Proxy Stream:** [http://localhost:3000/proxy](http://localhost:3000/proxy)
- **Player Interface:** [http://localhost:3000/player](http://localhost:3000/player)
- Home Page: http\://localhost:3000/

---

## Multiple Camera Support

For multiple camera streams, update the `data/link.json` file with your stream links. The player interface will allow you to toggle between these streams.

Example `data/link.json`:

```json
{
  "links": [
    "http://localhost:1200/live/livestream.flv",
    "http://localhost:1200/live/cam2.flv",
    "http://localhost:1200/live/cam3.flv"
  ]
}
```

**Tip:** Test each stream using the player interface (visit [http://localhost:3000/player](http://localhost:3000/player)). Once confirmed, add the link to the JSON file.

---

## Additional Information

- **Public HTML Files:** Public HTML pages are served from the Express server on `EXPOSED_IP` (e.g., [http://localhost:3000](http://localhost:3000)).
- **Raw FLV Stream Access:** The raw FLV stream can be accessed at `http://localhost:1200/live/streamkey.flv`.
- **Development Status:** Documentation is still in progress, and some bugs may exist as the app is under active development. Feel free to raise issues or contact for support.

### Acknowledgements

Special thanks to **NodeMedia** for creating the WebAssembly module that enables FLV streaming on the web page.\
https\://www\.nodemedia.cn/

Thank you
