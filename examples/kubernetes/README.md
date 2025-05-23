# Kubernetes Deployment Example

This example demonstrates how to deploy the Inference Gateway UI with the Inference Gateway backend on Kubernetes using k3d.

## Prerequisites

- Docker installed and running
- kubectl installed
- Helm v3 installed
- ctlptl installed (for local Kubernetes cluster management)
- k3d installed (for local Kubernetes cluster)
- Task installed (optional, for automation)

## Deployment Options

This example provides two deployment options:

1. **Combined Deployment**: Deploy the UI with the Inference Gateway backend as a dependency (recommended)
2. **Separate Deployment**: Deploy the UI and connect it to an existing Inference Gateway instance
3. **Deploy with Ingress**: Deploy the UI with an ingress controller for external access
4. **Deploy with authentication**: Deploy the UI with authentication using a secret and IdP with OIDC

## Quick Start Using Task

The fastest way to get started is using the provided Task automation:

```bash
# Create a local k3d cluster with NGINX ingress controller and Cert-Manager
task deploy-infrastructure

# Set up secrets for providers (needed for DeepSeek integration)
task setup-secrets

# Deploy UI with Gateway
task deploy-with-ingress

# Access the UI (in another terminal)
task port-forward
```

Then access the UI at: http://localhost:3000
Or use the ingress to access the UI via the domain name: https://ui.inference-gateway.local

## Manual Deployment Steps

### 1. Create a Local Kubernetes Cluster with k3d

```bash
# Create cluster using the provided configuration
ctlptl apply -f Cluster.yaml

# Install NGINX ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install \
  --create-namespace \
  --namespace kube-system \
  --set controller.progressDeadlineSeconds=500 \
  --version 4.12.2 \
  --wait \
  ingress-nginx ingress-nginx/ingress-nginx

# Install Cert-Manager for TLS certificates
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install \
  --create-namespace \
  --namespace cert-manager \
  --version 1.17.2 \
  --set crds.enabled=true \
  --wait \
  cert-manager jetstack/cert-manager

# Create a self-signed issuer for TLS certificates, in production use a proper issuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
EOF
```

### 2. Deploy the UI with Gateway

```bash
# Deploy a secret for the provider, choose from many providers available in the docs
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: inference-gateway
  namespace: inference-gateway
  annotations:
    meta.helm.sh/release-name: inference-gateway-ui
    meta.helm.sh/release-namespace: inference-gateway
  labels:
    app.kubernetes.io/managed-by: Helm
type: Opaque
stringData:
  DEEPSEEK_API_KEY: your-secret-key
EOF

# Deploy UI with Gateway
helm upgrade --install inference-gateway-ui \
  oci://ghcr.io/inference-gateway/charts/inference-gateway-ui \
  --version 0.7.1 \
  --create-namespace \
  --namespace inference-gateway \
  --set replicaCount=1 \
  --set gateway.enabled=true \
  --set gateway.envFrom.secretRef=inference-gateway \
  --set gateway.envFrom.configMapRef=inference-gateway \
  --set-string "env[0].name=NODE_ENV" \
  --set-string "env[0].value=production" \
  --set-string "env[1].name=NEXT_TELEMETRY_DISABLED" \
  --set-string "env[1].value=1" \
  --set-string "env[2].name=INFERENCE_GATEWAY_URL" \
  --set-string "env[2].value=http://inference-gateway:8080/v1" \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=100m \
  --set resources.requests.memory=128Mi \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set "ingress.hosts[0].host=ui.inference-gateway.local" \
  --set "ingress.hosts[0].paths[0].path=/" \
  --set "ingress.hosts[0].paths[0].pathType=Prefix" \
  --set "ingress.tls[0].secretName=inference-gateway-ui-tls" \
  --set "ingress.tls[0].hosts[0]=ui.inference-gateway.local"
```

Access the UI at: http://localhost:3000
Or use the ingress to access the UI via the domain name: https://ui.inference-gateway.local

## Configuration

The deployment uses Helm's `--set` parameters instead of values files for clarity and direct configuration. Key configuration options include:

- `gateway.enabled`: Set to `true` to deploy the Gateway backend with the UI
- `ingress.enabled`: Enable ingress for external access

## Clean Up

```bash
# Remove the deployment
helm uninstall inference-ui -n inference-gateway

# Delete the namespace
kubectl delete namespace inference-gateway

# Delete the k3d cluster
ctlptl delete -f Cluster.yaml
```

Or, just run:

```bash
task delete-cluster
```
