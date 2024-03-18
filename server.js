const NodeMediaServer = require('node-media-server');
const express = require('express');
const path = require('path');

// port
const PORT = 80;


// Stream link
require("dotenv").config();
const hostip = process.env.HOST_IP;;
console.log("Server IP: ",hostip);
const StreamLink = 'http://' + hostip + ':8000/live/livestream.flv'
console.log("Stream Link: ",StreamLink);

// Manual server link. Uncomment the next line to discard the environment set IP address
// StreamLink = 'http://iphere:8000/live/


// Set up NodeMediaServer for RTMP and HTTP-FLV streaming
const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 8000,
        mediaroot: './media',
        allow_origin: '*',
        webroot: './public',
        mediaroot: './media',
        allow_origin: '*'
    }
};

const nms = new NodeMediaServer(config);
nms.run();

// Set up Express.js server to serve static files
const app = express();
app.use(express.static('public'));


// Set up a route to render your HTML template and inject the StreamLink variable
app.get('/api/StreamLink', (req, res) => {
    console.log("| API | : Sending link:",StreamLink);
    const linkResponse = {
        link : StreamLink
    };

    res.json(linkResponse);
});

app.listen(PORT, () => {
    console.log('Server is running on port '+ PORT);
});
