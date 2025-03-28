FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install additional OS packages and dev tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends git-core curl build-essential

# Install specific npm version
RUN npm install -g npm@11.2.0

# Install global npm packages
RUN su node -c "npm install -g next typescript"

# Clean up
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*