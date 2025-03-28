FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install additional OS packages and dev tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends git-core curl build-essential zsh fonts-powerline

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