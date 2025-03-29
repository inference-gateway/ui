FROM mcr.microsoft.com/devcontainers/typescript-node:22

ENV DEBIAN_FRONTEND=noninteractive

# Install additional OS packages and dev tools
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    git-core \
    curl \
    build-essential \
    zsh \
    fonts-powerline

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get -y install gh

# Install specific npm version
RUN npm install -g npm@11.2.0

# Install global npm packages
RUN su node -c "npm install -g next typescript"

# Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git /home/node/.powerlevel10k
RUN echo 'source /home/node/.powerlevel10k/powerlevel10k.zsh-theme' >> /home/node/.zshrc
RUN echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> /home/node/.zshrc

# Set Zsh as default shell for node user
RUN chsh -s /usr/bin/zsh node

# Clean up
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*
