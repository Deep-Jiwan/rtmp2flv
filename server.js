// server.js
const express = require("express");
const path = require("path");
const fs = require('fs');
const { createProxyMiddleware } = require("http-proxy-middleware");
const NodeMediaServer = require("node-media-server");
require("dotenv").config();

// Load configuration from environment variables or fallback to defaults
const STREAM_IP = process.env.STREAM_IP || "localhost";
const MAIN_PORT = process.env.MAIN_PORT || 3000;
const INTERNAL_STREAM_PORT = process.env.INTERNAL_STREAM_PORT || 1200;
const EXPOSED_IP = process.env.EXPOSED_IP ||"localhost:3000";

// NodeMediaServer configuration on an internal port (not exposed directly)
const nmsConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30,
  },
  http: {
    port: INTERNAL_STREAM_PORT, // Internal port for streaming endpoints
    mediaroot: "./media",
    allow_origin: "*",
  },
};

const nms = new NodeMediaServer(nmsConfig);
nms.run();

// Express setup on the main port
const app = express();

// Proxy streaming requests to NodeMediaServer's HTTP server
app.use(
  "/proxy",
  createProxyMiddleware({
    target: `http://${STREAM_IP}:${INTERNAL_STREAM_PORT}/live/livestream.flv`,
    changeOrigin: true,
  })
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// API endpoint for dynamic stream link generation
app.get("/api/streamLink/main", (req, res) => {
  // Dynamically generate the stream link using the host IP
  const streamLink = `http://${EXPOSED_IP}/proxy/`;
  console.log("Providing stream link:", streamLink);
  res.json({ link: streamLink });
});

// Additional routes to serve HTML pages
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test.html"));
});
app.get("/player", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "player.html"));
});

app.get('/api/links', (req, res) => {
  const configPath = path.join(__dirname, '/data/links.json');

  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading links.config.json:', err);
      return res.status(500).json({ error: 'Failed to read links configuration.' });
    }
    
    try {
      // Parse JSON to verify it's valid (optional - you can simply send raw data if preferred)
      const links = JSON.parse(data);
      res.json(links);
    } catch (parseError) {
      console.error('Error parsing links.json:', parseError);
      res.status(500).json({ error: 'Invalid JSON in links configuration.' });
    }
  });
});

// Start Express on the main port
app.listen(MAIN_PORT, () => {
  console.log(`Express server is running on port ${MAIN_PORT}`);
});
