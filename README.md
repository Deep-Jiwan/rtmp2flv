A node js app that listens for an rtmp stream and then publishes on a webpage using supported HTTP-FLV   
- Low latency  
- Low spec  
- Docker friendly  
- Easy to setup and use  

Configuration:  

HOST_IP=source IP of the RTMP stream  

Streaming Settings = {  

  'server' : `rtmp://HOST_IP/live`,  
  'streamkey' : `livestream`
  
}  
  

    
Usage:  
  
Local Dev: 
1. Clone the repo  `git clone https://github.com/Deep-Jiwan/rtmp2flv.git`
2. Duplicate the .env.template file and rename it to '.env'  
3. Configure the .env file by specifying the IP address of the source of the RTMP  
4. Run in terminal  `node server.js`
5. Test the app by sending the stream and watching the same on web browser at `localhost:80`



Docker Deployement:
1. Run the command
   `docker pull ghcr.io/deep-jiwan/rtmp2flv:latest`
2. Run the docker container with the following port and environment variable
   `docker run -d -p 1935:1935 -p 80:80 -p 8000:8000 -e HOST_IP=ip_address ghcr.io/deep-jiwan/rtmp2flv:latest`
3. Test the app by sending the stream and watching the same on web browser at `localhost:80`


Good Luck!
