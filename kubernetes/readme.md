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
- [Testing Scenarios](#Testing-Scenarios)



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

### Docker File Explanation

This Dockerfile creates a lightweight container for my RTMP2FLV application.   
Read more about this application [here](https://github.com/Deep-Jiwan/rtmp2flv)    
Here's a breakdown of each instruction:

### Base Image
```dockerfile
FROM node:alpine
```
- Uses the official Node.js image with Alpine Linux as the base
- Alpine is chosen for its small footprint (typically <5MB), resulting in smaller overall container size

### Working Directory
```dockerfile
WORKDIR /app
```
- Sets the working directory inside the container to `/app`
- All subsequent commands will run from this location

### Dependency Management
```dockerfile
COPY package*.json ./
RUN npm install
```
- Copies only the package.json and package-lock.json files first
- Runs npm install to install dependencies
- This approach leverages Docker's layer caching for faster builds (dependencies won't reinstall unless package files change)

### Application Code
```dockerfile
COPY server.js ./
COPY . .
```
- First copies only the server.js file
- Then copies all remaining files from the current directory on the host to the working directory in the container
- Note: Copying server.js separately is redundant since the subsequent command copies everything

### Port Configuration
```dockerfile
EXPOSE 3000 1935 1200
```
- Informs Docker that the container listens on ports 3000, 1935, and 1200 at runtime
- These ports are:
  - 3000: Likely for the main web application
  - 1935: Commonly used for RTMP (Real-Time Messaging Protocol)
  - 1200: Custom application port

### Start Command
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

## 1. Application Availability Tests

Verify that your application is accessible through its Kubernetes service.   
Due to windows limited networking options, we can port forward the service to out guest OS and access the services directly on their main ports.


```bash
kubectl port-forward svc/rtmp2flv-service 3000:3000 1200:1200 1935:1935

# In a seperate terminal, run the following
kubectl get services
curl http://localhost:3000/
```

**Expected Result**: The application responds with its homepage.

## 2. Scaling Tests

Test if Horizontal Pod Autoscaler (HPA) correctly scales your application under load.

```bash
kubectl get hpa
kubectl run --rm -it --image=busybox stress-test -- /bin/sh

# Inside the BusyBox shell, run:
while true; do wget -q -O- http://10.244.0.6:3000; done
```
`10.244.0.6` is the IP address for one of the nodes in the cluster. We will stress-test this node

**Expected Result**: The number of pods increased as load increased.

**Verification**:
```bash
kubectl get pods -w
```

## 3. Rolling Update & Rollback Test

Test zero-downtime updates and rollback functionality.

### Rolling Update
```bash
# Update the application to a new version
kubectl set image deployment/rtmp2flv-deployment rtmp2flv=ghcr.io/deep-jiwan/rtmp2flv:newPlayer

# Monitor the update progress
kubectl rollout status deployment/rtmp2flv-deployment
```

**Expected Result**: Application updates with no downtime, new version becomes available.

### Rollback Test
```bash
# Rollback to the previous version
kubectl rollout undo deployment/rtmp2flv-deployment

# Monitor the rollback progress
kubectl rollout status deployment/rtmp2flv-deployment
```

**Expected Result**: Application reverts to the previous working version with no downtime.


## 4. Pod Failure and Self-Healing Test

Test Kubernetes' ability to automatically recover from pod failures.

```bash
kubectl get pods

# Delete a specific pod

kubectl delete pod rtmp2flv-deployment-644cd8656c-gpwn5
```

**Expected Result**: Kubernetes automatically creates a new pod to replace the deleted one.

**Verification**:
```bash
# Watch the pod recreation in real-time
kubectl get pods -w
```

## 5. Persistent Storage Test

Verify that data persists after pod restarts (if your application uses persistent volumes).   

Note: These tests were not performed since the application does not use any persistent storage. The steps to perform these test are however outlined here for reference
```bash
# Connect to a pods terminal
kubectl exec -it rtmp2flv-deployment-644cd8656c-8c7vb -- /bin/sh

# Inside the pod, create a test file in the persistent volume mount
echo "Test data" > /path/to/mounted/volume/test-file.txt

# Exit the pod and delete it
exit
kubectl delete pod rtmp2flv-deployment-644cd8656c-8c7vb

# Wait for a new pod to start, then connect to it
kubectl get pods -w
kubectl exec -it <new-pod-name> -- /bin/sh

# Check if the test file still exists
cat /path/to/mounted/volume/test-file.txt
```

**Expected Result**: The test file should still exist in the new pod, showing that data persisted.

## 6. Logging Test

Verify that application logs are being captured correctly.

```bash
# View logs for a specific pod
kubectl logs rtmp2flv-deployment-644cd8656c-8c7vb

# Follow logs in real-time
kubectl logs -f rtmp2flv-deployment-644cd8656c-8c7vb
```

**Expected Result**: Application logs should be visible and contain relevant information.


## Troubleshooting Common Issues

- If pods are failing to start, check events: `kubectl describe pod <pod-name>`
- For networking issues, verify service and ingress configurations: `kubectl get svc,ing`
- Check resource constraints if autoscaling isn't working: `kubectl describe hpa`



