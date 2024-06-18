A node js app that listens for an rtmp stream and then publishes on a webpage using supported HTTP-FLV   
- Low latency  
- Low spec  
- Docker friendly  
- Easy to setup and use  

Configuration:  

HOST_IP=source IP of the RTMP stream  

Streaming Settings = {  

  'server' : `rtmp://SERVER_IP/live`,  
  'streamkey' : `livestream`
  
}  
  

    
Usage:  
  
Local Dev: 
1. Clone the repo  `git clone https://github.com/Deep-Jiwan/rtmp2flv.git`
2. Duplicate the .env.template file and rename it to '.env'  
3. Configure the .env file by specifying the IP address of the server (avoid using localhost or loopback ip 127.0.0.1. See FAQ)  
4. Having node js installed on your device, open a new terminal in the folder and run `npm install`
4. Run in terminal  `node server.js`
5. Stream using RTMP to the server.  
   Stream Server: `rtmp://server_ip/live`  
   Stream key: `livestream`  
6. Start streaming and watch the same on web browser at `SERVER_IP:80`  
7. The FLV stream is also available at: `http://SERVER_IP:8000/live/livestream.flv`. It can be viewed in any popular video player and mixing software as a network stream. (VLC, VMIX, OBS)  



Docker Deployement:
1. Run the command
   `docker pull ghcr.io/deep-jiwan/rtmp2flv:latest`
2. Run the docker container with the following port and environment variable
   `docker run -d -p 1935:1935 -p 80:80 -p 8000:8000 -e HOST_IP=ip_address ghcr.io/deep-jiwan/rtmp2flv:latest`  
   Replace 'ip_address' with the IP Address of the server / app hosting machine
3. Stream using RTMP to the server.    
   Stream Server: `rtmp://server_ip/live`  
   Stream key: `livestream`  
6. Start streaming and watch the same on web browser at `SERVER_IP:80`  
7. The FLV stream is also available at: `http://SERVER_IP:8000/live/livestream.flv`. It can be viewed in any popular video player and mixing software as a network stream. (VLC, VMIX, OBS)  



Good Luck!

Terminal Clarification:  
- Host IP is the IP address of the server that is hosting the application.  
- Server ip is the same as Host IP  

FAQ:  
1. I cant view the stream on other devices on the network.  
   - You may have set the environment variable HOST_IP as localhost or 127.0.0.1.  
      Replace it with the manual ip address of the server