.PHONY: build build-tauri-dev-bin build-tauri-flatpak build-tauri-flatpak-clean build-tauri-flatpak-sources build-web cce check check-image-dev check-image-flatpak clean clean-build clean-images clean-tauri clean-tauri clean-tauri-fast clean-web default dev-tauri-X dev-web icons-tauri icons-web image-dev image-flatpak lint lint-tauri lint-web npm-install npm-install-tauri npm-install-web shell shell-tauri shell-web test test-tauri-unit test-web-unit type-check type-check-tauri type-check-web

default: dev-web

CONTAINER_ENGINE=podman
IMAGE_DEV=lonewolf:dev
IMAGE_FLATPAK=lonewolf:flatpak

image-dev: cce
	$(CONTAINER_ENGINE) build . --no-cache -f dev.Dockerfile -t $(IMAGE_DEV)

image-flatpak: cce
	$(CONTAINER_ENGINE) build . --no-cache -f flatpak.Dockerfile -t $(IMAGE_FLATPAK)

build: build-web build-tauri-flatpak

build-tauri-dev-bin: check-image-dev clean-tauri icons-web
	mkdir -p build
	rm -rf build/lonewolf-dev.bin
	rm -rf lonewolf-tauri/src-tauri/target/release/build/lonewolf*
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "npm run tauri build"
	cp lonewolf-tauri/src-tauri/target/release/bundle/deb/lonewolf_*/data/usr/bin/lonewolf build/lonewolf-dev.bin

build-tauri-flatpak-sources:
	rm -rf build/flatpak
	mkdir -p build/flatpak
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_FLATPAK) bash -l -c "flatpak-cargo-generator.py lonewolf-tauri/src-tauri/Cargo.lock -o build/flatpak/cargo-sources.json"
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_FLATPAK) bash -l -c "flatpak-npm-generator.py lonewolf-tauri/package-lock.json -o build/flatpak/npm-sources.json"

build-tauri-flatpak: check-image-flatpak clean-tauri build-tauri-flatpak-sources icons-tauri
	mkdir -p .flatpak
	$(CONTAINER_ENGINE) run --rm --privileged -it -v .:/app-dir -w /app-dir/.flatpak $(IMAGE_FLATPAK) bash -l -c "flatpak-builder --ccache --force-clean --repo=repo application /app-dir/lonewolf-tauri/site.someones.Lonewolf.yml;"
	$(CONTAINER_ENGINE) run --rm --privileged -it -v .:/app-dir -w /app-dir/.flatpak $(IMAGE_FLATPAK) bash -l -c "flatpak build-bundle repo lonewolf.flatpak site.someones.Lonewolf --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo;"
	cp .flatpak/lonewolf.flatpak build/lonewolf.flatpak
	@echo install with 'flatpak install --user .flatpak/lonewolf.flatpak'
	@echo run with 'flatpak run site.someones.Lonewolf'

build-tauri-flatpak-clean:
	rm -rf .flatpak build/flatpak build/lonewolf.flatpak

build-web: check-image-dev
	rm -rf build/web
	mkdir -p build/web
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c "npm run build"
	cp -r lonewolf-web/dist/* build/web

cce:
	@if \!  hash $(CONTAINER_ENGINE) 1>/dev/null 2>&1; then echo "Container engine ($(CONTAINER_ENGINE)) not found\!"; exit 1;fi

check-image-dev: cce
	@if [ $$(podman images -q $(IMAGE_DEV) | wc -l) == "0" ]; then echo "Container image not found. Try running 'make image-dev'.";exit 1; fi

check-image-flatpak: cce
	@if [ $$(podman images -q $(IMAGE_FLATPAK) | wc -l) == "0" ]; then echo "Container image not found. Try running 'make image-flatpak'.";exit 1; fi

check: lint type-check

clean: clean-tauri clean-web

clean-tauri:
	rm -rf src-tauri/icons/*
	rm -rf lonewolf-tauri/dist
	rm -rf lonewolf-tauri/src-tauri/target

clean-web:
	rm -rf lonewolf-web/public/favicon.ico
	rm -rf lonewolf-web/dist

clean-build:
	rm -rf build

clean-images: cce
	$(CONTAINER_ENGINE) image rm $(IMAGE_DEV)  || true
	$(CONTAINER_ENGINE) image rm $(IMAGE_FLATPAK) || true

clean-tauri-fast:
	rm -rf lonewolf-tauri/src-tauri/target/debug/build/lonewolf-* lonewolf-tauri/src-tauri/target/release/bundle

dev-tauri-X: check-image-dev icons-tauri
	xhost +
	$(CONTAINER_ENGINE) run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "npm run tauri dev"
	xhost -

dev-web: check-image-dev icons-web
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run dev -- --host'

icons-tauri: lonewolf-tauri/src-tauri/icons/512x512-lonewolf.png lonewolf-tauri/public/lonewolf.png lonewolf-tauri/public/icon.png

icons-web: check-image-dev lonewolf-web/public/favicon.ico lonewolf-web/public/lonewolf.png lonewolf-web/public/icon.png

lonewolf-tauri/src-tauri/icons/512x512-lonewolf.png: lonewolf/assets/icon.svg
	mkdir -p lonewolf-tauri/src-tauri/icons
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 512x512 -format png src-tauri/icons/512x512-lonewolf.png'
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run tauri icon -- src-tauri/icons/512x512-lonewolf.png -o src-tauri/icons'

lonewolf-web/public/favicon.ico: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 64x64 -format ico public/favicon.ico'

lonewolf-web/public/lonewolf.png: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/lonewolf.svg -resize 512x512 -format png public/lonewolf.png'

lonewolf-web/public/icon.png: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 128x128 -format png public/icon.png'

lonewolf-tauri/public/lonewolf.png: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/lonewolf.svg -resize 512x512 -format png public/lonewolf.png'

lonewolf-tauri/public/icon.png: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 128x128 -format png public/icon.png'


lint: lint-web lint-tauri

lint-tauri: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run lint'

lint-web: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run lint'

npm-install: npm-install-web npm-install-tauri

npm-install-tauri: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm install'

npm-install-web: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm install'

shell: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_DEV) bash -l

shell-tauri: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash

shell-web: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash

test: test-tauri-unit test-web-unit

test-tauri-unit: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run test:unit'

test-web-unit: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run test:unit'

type-check: type-check-web type-check-tauri

type-check-tauri: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run type-check'

type-check-web: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run type-check'

