FROM archlinux

RUN pacman-key --init
RUN pacman -Sy --noconfirm archlinux-keyring
RUN pacman -Syyu --noconfirm nodejs npm taskell

RUN ln -s /usr/share/zoneinfo/UTC /etc/localtime

WORKDIR /app

