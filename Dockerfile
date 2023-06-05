FROM archlinux
RUN ln -s /usr/share/zoneinfo/UTC /etc/localtime

RUN pacman-key --init
RUN pacman -Sy --noconfirm archlinux-keyring
RUN pacman -Syyu --noconfirm bash xorg-xeyes nodejs npm webkit2gtk base-devel curl wget openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg libvips imagemagick
RUN npm update -g npm

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y

RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc

RUN bash -c 'export PATH=$PATH:/root/.cargo/bin; rustup self update'

ENV CARGO_HOME=/app/lonewolf-tauri

WORKDIR /app
