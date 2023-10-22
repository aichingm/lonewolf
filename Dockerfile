FROM archlinux

RUN ln -s /usr/share/zoneinfo/UTC /etc/localtime

RUN pacman-key --init
RUN pacman -Sy archlinux-keyring --noconfirm && \
    pacman -Syu --noconfirm \
                             alsa-lib \
                             appmenu-gtk-module \
                             base-devel \
                             bash \
                             curl \
                             flatpak \
                             flatpak-builder \
                             git \
                             gtk3 \
                             librsvg \
                             libappindicator-gtk3 \
                             librsvg \
                             libvips \
                             nodejs \
                             npm \
                             nss \
                             openssl \
                             python \
                             python-aiohttp \
                             python-pipx \
                             python-toml \
                             webkit2gtk \
                             wget

RUN npm update -g npm

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y

RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc

RUN bash -c 'export PATH=$PATH:/root/.cargo/bin; rustup self update'

ENV CARGO_HOME=/app/lonewolf-tauri

RUN npm install -g puppeteer

RUN git clone https://github.com/flatpak/flatpak-builder-tools.git /opt/flatpak-builder-tools
RUN echo 'export PATH=$PATH:/root/.local/bin' >> /root/.bashrc
RUN cd /opt/flatpak-builder-tools/node; pipx install .
RUN cp /opt/flatpak-builder-tools/cargo/flatpak-cargo-generator.py /usr/bin/flatpak-cargo-generator.py
RUN chmod +x /usr/bin/flatpak-cargo-generator.py

WORKDIR /app

