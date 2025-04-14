# Kubernetes Deployment Example

This example demonstrates how to deploy the Inference Gateway UI with the Inference Gateway backend on Kubernetes using k3d.

## Prerequisites

- Docker installed and running
- kubectl installed
- Helm v3 installed
- k3d installed (for local Kubernetes cluster)
- Task installed (optional, for automation)

## Deployment Options

This example provides two deployment options:

1. **Combined Deployment**: Deploy the UI with the Inference Gateway backend as a dependency (recommended)
2. **Separate Deployment**: Deploy the UI and connect it to an existing Inference Gateway instance

## Quick Start Using Task

The fastest way to get started is using the provided Task automation:

```bash
# Create a local k3d cluster with NGINX ingress controller
task create-cluster

# Set up secrets for providers (needed for OpenAI integration)
task setup-secrets

# Deploy UI with Gateway
task deploy

# Access the UI (in another terminal)
task port-forward
```

Then access the UI at: http://localhost:3000

## Manual Deployment Steps

### 1. Create a Local Kubernetes Cluster with k3d

```bash
# Create cluster using the provided configuration
k3d cluster create --config Cluster.yaml

# Install NGINX ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
```

### 2. Install cert-manager (if using TLS)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/instance=cert-manager --timeout=90s

# Create self-signed issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
EOF
```

### 3. Deploy the UI with Gateway

```bash
# Create namespace
kubectl create namespace inference-gateway

# Deploy UI with Gateway
helm install inference-ui oci://ghcr.io/inference-gateway/charts/ui \
  --namespace inference-gateway \
  --set gateway.enabled=true \
  --set gateway.replicaCount=1 \
  --set gateway.service.type=ClusterIP \
  --set gateway.service.port=8080 \
  --set gateway.auth.provider=none \
  --set gateway.providers.openai.enabled=true \
  --set replicaCount=1 \
  --set "env[0].name=NODE_ENV,env[0].value=production" \
  --set "env[1].name=NEXT_TELEMETRY_DISABLED,env[1].value=1"
```

### 4. Access the Application

#### Without Ingress

Port-forward to access the UI and Gateway:

```bash
# Access UI
kubectl port-forward svc/inference-ui 3000:3000 -n inference-gateway

# Access Gateway API directly (in another terminal)
kubectl port-forward svc/inference-ui-gateway 8080:8080 -n inference-gateway
```

Then access the UI at: http://localhost:3000

#### With Ingress

Deploy with ingress enabled:

```bash
helm install inference-ui oci://ghcr.io/inference-gateway/charts/ui \
  --namespace inference-gateway \
  --set gateway.enabled=true \
  --set replicaCount=1 \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set "ingress.hosts[0].host=ui.inference-gateway.local" \
  --set "ingress.hosts[0].paths[0].path=/" \
  --set "ingress.hosts[0].paths[0].pathType=Prefix"

# Add entry to /etc/hosts
sudo sh -c 'echo "127.0.0.1 ui.inference-gateway.local" >> /etc/hosts'
```

Access the UI at: https://ui.inference-gateway.local

## Configuration

The deployment uses Helm's `--set` parameters instead of values files for clarity and direct configuration. Key configuration options include:

- `gateway.enabled`: Set to `true` to deploy the Gateway backend with the UI
- `gateway.auth.provider`: Authentication provider (none, auth0, azure-ad)
- `gateway.providers.openai.enabled`: Enable OpenAI provider
- `backendConfig.url`: URL to existing Gateway (when `gateway.enabled=false`)
- `ingress.enabled`: Enable ingress for external access

## Clean Up

```bash
# Remove the deployment
helm uninstall inference-ui -n inference-gateway

# Delete the namespace
kubectl delete namespace inference-gateway

# Delete the k3d cluster
k3d cluster delete inference-gateway-dev
```
