# RTMP2FLV Application

This README provides comprehensive guidance for setting up, deploying, and managing the RTMP2FLV application in a Kubernetes environment. It covers installation, deployment, auto-scaling, logging, and update strategies.

## Table of Contents

- [Installation of minikube](#installation-of-minikube)
  - [Windows Setup](#windows-setup)
  - [Minikube Setup](#minikube-setup)
  - [Metrics Server Setup](#metrics-server-setup)
- [Application and Dockerization](#application-and-dockerization)
- [Kubernetes Resources](#kubernetes-resources)
  - [Deployment](#deployment)
  - [Service](#service)
  - [ConfigMap](#configmap)
- [Implementing Auto-Scaling (HPA)](#implementing-auto-scaling-hpa)
- [Logging](#logging)
- [Rolling Updates & Rollbacks](#rolling-updates--rollbacks)



## Installation of Minikube

### Windows Setup

1. **Download and Install Docker:**  
   Download Docker Desktop for Windows from the [Docker website](https://www.docker.com/products/docker-desktop). Complete the installation and verify that Docker is running correctly.   
    ```bash
    docker -v
    ```

2. **Download and Install Minikube:**  
   Begin by downloading Minikube from the official [Minikube Guide](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fwindows%2Fx86-64%2Fstable%2F.exe+download) page. Install it on your Windows system and ensure it is added to your environment PATH.   

    ```bash
    minikube
    ```
    This should output a help and commands list for minikube

### Minikube Setup

1. **Start Minikube:**  
   Open your terminal or PowerShell and initialize Minikube with the following command:
   ```bash
   minikube start --driver=docker --nodes=2
   ```
   This will start 3 minikube docker containers. It will create 2 worker nodes and 1 control-plane node using the docker driver

2.  **Add worker label to the created nodes (Optional):**
    ```bash
    kubectl label node minikube-m02 node-role.kubernetes.io/worker=
    kubectl label node minikube-m03 node-role.kubernetes.io/worker=
    ```   

3. **Verify Minikube Status:**  
   Confirm that all system pods are running:
   ```bash
   kubectl get po -A
   ```
   Ensure all components are in a running state.
### Metrics Server Setup

1. **Deploy Metrics Server:**  
   Apply the Metrics Server components:
   ```bash
   minikube addons enable metrics-server
   ```

2. **Verify Metrics Server Deployment:**  
   Check that the Metrics Server pod is operational:
   ```bash
   kubectl get pods -n kube-system
   ```

3. **Check Resource Metrics:**  
   Validate that metrics are being collected:
   ```bash
   kubectl top pods --all-namespaces
   ```

### Minikube Dashboard setup

1.  **Launch the minikube dashboard**
    
    ```bash
    minikube dashboard
    ```


## Application and Dockerization   

# Docker File Explanation

This Dockerfile creates a lightweight container for my RTMP2FLV application.   
Read more about this application [here](https://github.com/Deep-Jiwan/rtmp2flv)    
Here's a breakdown of each instruction:

## Base Image
```dockerfile
FROM node:alpine
```
- Uses the official Node.js image with Alpine Linux as the base
- Alpine is chosen for its small footprint (typically <5MB), resulting in smaller overall container size

## Working Directory
```dockerfile
WORKDIR /app
```
- Sets the working directory inside the container to `/app`
- All subsequent commands will run from this location

## Dependency Management
```dockerfile
COPY package*.json ./
RUN npm install
```
- Copies only the package.json and package-lock.json files first
- Runs npm install to install dependencies
- This approach leverages Docker's layer caching for faster builds (dependencies won't reinstall unless package files change)

## Application Code
```dockerfile
COPY server.js ./
COPY . .
```
- First copies only the server.js file
- Then copies all remaining files from the current directory on the host to the working directory in the container
- Note: Copying server.js separately is redundant since the subsequent command copies everything

## Port Configuration
```dockerfile
EXPOSE 3000 1935 1200
```
- Informs Docker that the container listens on ports 3000, 1935, and 1200 at runtime
- These ports are:
  - 3000: Likely for the main web application
  - 1935: Commonly used for RTMP (Real-Time Messaging Protocol)
  - 1200: Custom application port

## Start Command
```dockerfile
CMD [ "node", "server.js" ]
```
- Specifies the command to run when the container starts
- Runs the Node.js application using the server.js file



## Kubernetes Resources

### Deployment

1. **Create Deployment:**  
   Create the deployment.yaml file with 3 replicas, the image name:tag, port configurations and env variables config file and apply your deployment configuration:

   ```bash
   kubectl apply -f rtmp2flv-deployment.yaml
   ```

### Service

2. **Create Service:**  
   Describe the service, NodePorts and apply the service configuration:

   ```bash
   kubectl apply -f rtmp2flv-service.yaml
   ```

### ConfigMap

3. **Create ConfigMap:**  
   Create a config map for environment variables and apply the configuration map ( if applicable ):

   ```bash
   kubectl apply -f rtmp2flv-config.yaml
   ```

## Implementing Auto-Scaling (HPA)

1. **Define the Horizontal Pod Autoscaler (HPA):**  
   Create an `rtmp2flv-hpa.yaml` with the following configuration to have minimum 2 replicas and maximum 5 and to scale when CPU utilization is over 50%:
   ```yaml
    apiVersion: autoscaling/v2
    kind: HorizontalPodAutoscaler
    metadata:
      name: rtmp2flv-hpa
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: rtmp2flv-deployment
      minReplicas: 2
      maxReplicas: 5
      metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 50
   ```

2. **Apply the HPA Configuration:**  
   ```bash
   kubectl apply -f rtmp2flv-hpa.yaml
   ```

3. **Verify HPA Status:**  
   ```bash
   kubectl get hpa rtmp2flv-hpa
   ```

## Logging

### Viewing Logs

- **Get the list of pods and names:**  
  ```bash
  kubectl get pods

- **Single Pod Logs:**  
  ```bash
  kubectl logs <pod-name>
  ```
  
- **Real-Time Log Streaming:**  
  ```bash
  kubectl logs -f <pod-name>



## Testing Scenarios



### Rolling Update

1. **Update Deployment Image:**  
   ```bash
   kubectl set image deployment/rtmp2flv-deployment rtmp2flv=ghcr.io/deep-jiwan/rtmp2flv:v2
   ```

2. **Monitor Rollout:**  
   ```bash
   kubectl rollout status deployment/rtmp2flv-deployment
   ```

### Rollback

1. **View Rollout History:**  
   ```bash
   kubectl rollout history deployment/rtmp2flv-deployment
   ```

2. **Rollback to Previous Revision:**  
   ```bash
   kubectl rollout undo deployment/rtmp2flv-deployment
   ```

3. **Verify Rollback:**  
   ```bash
   kubectl rollout status deployment/rtmp2flv-deployment




