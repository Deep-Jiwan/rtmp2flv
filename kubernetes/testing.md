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
kubectl set image deployment/<deployment-name> <container-name>=<new-image>:v2

# Monitor the update progress
kubectl rollout status deployment/<deployment-name>
```

**Expected Result**: Application updates with no downtime, new version becomes available.

### Rollback Test
```bash
# Rollback to the previous version
kubectl rollout undo deployment/<deployment-name>

# Monitor the rollback progress
kubectl rollout status deployment/<deployment-name>
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