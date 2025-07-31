FROM mcr.microsoft.com/devcontainers/typescript-node:22

ENV DEBIAN_FRONTEND=noninteractive

# Install additional OS packages and dev tools
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    git-core \
    curl \
    build-essential \
    zsh \
    fonts-powerline \
    apt-transport-https \
    gnupg \
    lsb-release \
    ca-certificates

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get -y install gh

# Install specific npm version
RUN npm install -g npm@11.2.0

RUN npm install -g @anthropic-ai/claude-code

# Install global npm packages
RUN su node -c "npm install -g next typescript"

# Install latest Helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install kubectl
RUN curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list \
    && apt-get update \
    && apt-get install -y kubectl

# Install k3d
RUN curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Install ctlptl
RUN curl -fsSL https://github.com/tilt-dev/ctlptl/releases/download/v0.8.40/ctlptl.0.8.40.linux.x86_64.tar.gz | tar -xzv -C /usr/local/bin ctlptl

# Install Task
RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

# Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git /home/node/.powerlevel10k
RUN echo 'source /home/node/.powerlevel10k/powerlevel10k.zsh-theme' >> /home/node/.zshrc
RUN echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> /home/node/.zshrc

# Add Helm, kubectl, and k3d autocompletion to zsh
RUN echo '# Enable autocompletion' >> /home/node/.zshrc
RUN echo 'autoload -Uz compinit && compinit' >> /home/node/.zshrc
RUN echo 'source <(helm completion zsh)' >> /home/node/.zshrc
RUN echo 'source <(kubectl completion zsh)' >> /home/node/.zshrc
RUN echo 'source <(k3d completion zsh)' >> /home/node/.zshrc
RUN echo 'source <(task --completion zsh)' >> /home/node/.zshrc
RUN echo 'source <(ctlptl completion zsh)' >> /home/node/.zshrc

# Set Zsh as default shell for node user
RUN chsh -s /usr/bin/zsh node

# Clean up
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*
