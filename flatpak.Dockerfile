FROM archlinux

RUN ln -s /usr/share/zoneinfo/UTC /etc/localtime

RUN pacman-key --init
RUN pacman -Sy archlinux-keyring --noconfirm && \
    pacman -Syu --noconfirm \
                            bash \
                            curl \
                            python \
                            python-aiohttp \
                            python-toml \
                            flatpak \
                            flatpak-builder

# for some reason 21.08 == 42!?

RUN flatpak install -y org.freedesktop.Platform//22.08 org.freedesktop.Sdk//22.08 org.gnome.Platform//42 org.gnome.Sdk//42 runtime/org.freedesktop.Sdk.Extension.rust-nightly/x86_64/21.08 runtime/org.freedesktop.Sdk.Extension.node16/x86_64/21.08

RUN curl -o /usr/bin/flatpak-npm-generator.py https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/npm/flatpak-npm-generator.py
RUN curl -o /usr/bin/flatpak-cargo-generator.py https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/cargo/flatpak-cargo-generator.py

RUN chmod +x /usr/bin/flatpak-npm-generator.py
RUN chmod +x /usr/bin/flatpak-cargo-generator.py

WORKDIR /
