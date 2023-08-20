FROM archlinux

RUN ln -s /usr/share/zoneinfo/UTC /etc/localtime

RUN pacman-key --init
RUN pacman -Sy archlinux-keyring --noconfirm && \
    pacman -Syu --noconfirm \
                             base-devel \
                             bash \
                             nodejs \
                             npm \
                             curl \
                             wget \
                             webkit2gtk \
                             appmenu-gtk-module \
                             libappindicator-gtk3 \
                             librsvg \
                             libvips \
                             imagemagick \
                             gtk3 \
                             openssl \
                             alsa-lib nss 

RUN npm update -g npm

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y

RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc

RUN bash -c 'export PATH=$PATH:/root/.cargo/bin; rustup self update'

ENV CARGO_HOME=/app/lonewolf-tauri

RUN npm install -g puppeteer

WORKDIR /app
