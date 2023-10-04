.PHONY: build build-flatpak build-flatpak build-tauri-flatpak-sources build-web cce check check-image-dev check-image-flatpak clean clean-build clean-build-flatpak clean-build-tauri clean-build-web clean-container-images clean-tauri clean-web default dev-tauri-X dev-web icons-tauri icons-web image-dev image-flatpak lint lint-tauri lint-web list-file-targets list-phony-targets npm-install npm-install-tauri npm-install-web shell shell-tauri shell-web test test-tauri-unit test-web-unit type-check type-check-tauri type-check-web
default: dev-web

CONTAINER_ENGINE=podman
IMAGE_DEV=lonewolf:dev
IMAGE_FLATPAK=lonewolf:flatpak

build: build/web build/lonewolf.flatpak

build-tauri-flatpak-sources: build/flatpak/node-sources.json build/flatpak/cargo-sources.json

build-flatpak: clean-tauri build-tauri-flatpak-sources icons-tauri check-image-flatpak
	mkdir -p .flatpak
	$(CONTAINER_ENGINE) run --rm --privileged -it -v .:/app-dir -w /app-dir/.flatpak $(IMAGE_FLATPAK) bash -l -c "flatpak-builder --ccache --force-clean --repo=repo application /app-dir/lonewolf-tauri/site.someones.Lonewolf.yml;"
	$(CONTAINER_ENGINE) run --rm --privileged -it -v .:/app-dir -w /app-dir/.flatpak $(IMAGE_FLATPAK) bash -l -c "flatpak build-bundle repo lonewolf.flatpak site.someones.Lonewolf --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo;"
	cp .flatpak/lonewolf.flatpak build/lonewolf.flatpak

build-tauri: clean-build-tauri icons-tauri check-image-dev
	mkdir -p build
	rm -rf build/lonewolf-dev.bin
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "npm run tauri build -- -b deb"
	cp lonewolf-tauri/src-tauri/target/release/bundle/deb/lonewolf_*/data/usr/bin/lonewolf build/lonewolf-dev.bin

build-web: check-image-dev icons-tauri
	rm -rf build/web
	mkdir -p build/web
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c "npm run build"
	cp -r lonewolf-web/dist/* build/web
	rm -rf lonewolf-web/dist

cce:
	@if \! hash $(CONTAINER_ENGINE) 1>/dev/null 2>&1; then echo "Container engine ($(CONTAINER_ENGINE)) not found\!"; exit 1;fi

check: lint type-check

check-image-dev: cce
	@if [ $$(podman images -q $(IMAGE_DEV) | wc -l) == "0" ]; then echo "Container image not found. Try running 'make image-dev'.";exit 1; fi

check-image-flatpak: cce
	@if [ $$(podman images -q $(IMAGE_FLATPAK) | wc -l) == "0" ]; then echo "Container image not found. Try running 'make image-flatpak'.";exit 1; fi

clean: clean-tauri clean-web clean-build

clean-build: clean-build-web clean-build-flatpak clean-build-tauri
	rm -rf build

clean-build-flatpak:
	rm -rf .flatpak build/flatpak build/lonewolf.flatpak

clean-build-tauri:
	rm -rf src-tauri/icons/* lonewolf-tauri/dist lonewolf-tauri/src-tauri/target/release/build/lonewolf* build/lonewolf-dev.bin

clean-build-web:
	rm -rf build/web lonewolf-web/dist lonewolf-web/public/favicon.ico

clean-container-images: cce
	$(CONTAINER_ENGINE) image rm $(IMAGE_DEV) || true
	$(CONTAINER_ENGINE) image rm $(IMAGE_FLATPAK) || true

clean-tauri:
	rm -rf lonewolf-tauri/src-tauri/target lonewolf-tauri/node_modules

clean-web:
	rm -rf lonewolf-web/node_modules


dev-tauri-X: icons-tauri
	@make -s check-image-dev
	xhost +
	$(CONTAINER_ENGINE) run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "npm run tauri dev"
	xhost -

dev-tauri-X-shell: icons-tauri
	@make -s check-image-dev
	xhost +
	$(CONTAINER_ENGINE) run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l
	xhost -

dev-web: check-image-dev icons-web
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run dev -- --host'

lonewolf/assets/icons.ts:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/ -w /app/lonewolf/assets $(IMAGE_DEV) bash icons.sh

icons-tauri: lonewolf/assets/icons.ts lonewolf-tauri/src-tauri/icons/512x512-lonewolf.png lonewolf-tauri/public/lonewolf.png lonewolf-tauri/public/icon.png

icons-web: lonewolf/assets/icons.ts lonewolf-web/public/favicon.ico lonewolf-web/public/lonewolf.png lonewolf-web/public/icon.png

image-dev: cce
	$(CONTAINER_ENGINE) build . --no-cache -f dev.Dockerfile -t $(IMAGE_DEV)

image-flatpak: cce
	$(CONTAINER_ENGINE) build . --no-cache -f flatpak.Dockerfile -t $(IMAGE_FLATPAK)

lint: lint-web lint-tauri

lint-tauri:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run lint'

lint-web:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run lint'

list-file-targets:
	grep -Po "^[a-zA-Z0-9\\-\/.]+:" Makefile | grep "\." | sed -e 's/:$$//' | sort | xargs

list-phony-targets:
	grep -Po "^[a-zA-Z0-9\\-\/]+:" Makefile | sed -e 's/:$$//' | sort | xargs

npm-install: npm-install-web npm-install-tauri

npm-install-tauri:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm install'

npm-install-web:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm install'

shell:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_DEV) bash -l

shell-tauri: check-image-dev
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash

shell-web: check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash

test: test-tauri-unit test-web-unit

test-tauri-unit:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run test:unit'

test-web-unit:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run test:unit'

type-check: type-check-web type-check-tauri

type-check-tauri:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run type-check'

type-check-web:
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run type-check'

# FILES

## BUILD

build/Lonewolf.png: Lonewolf.lwp
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'sh -c "export VITE_IGNORE_PLATFORM_CAN_SUPPORT=1; npm run dev -- --host" & SERVER=$$!; sleep 1; export NODE_PATH=$$(npm root --quiet -g); node scripts/print.js /app/Lonewolf.lwp /app/build/Lonewolf.png; kill -9 $$SERVER'

build/flatpak/cargo-sources.json: lonewolf-tauri/src-tauri/Cargo.lock
	@make -s check-image-dev
	mkdir -p build/flatpak
	rm -rf build/flatpak/cargo-sources.json
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_FLATPAK) bash -l -c "flatpak-cargo-generator.py lonewolf-tauri/src-tauri/Cargo.lock -o build/flatpak/cargo-sources.json"

build/flatpak/package-lock_v2.json: lonewolf-tauri/package-lock.json
	@make -s check-image-dev
	mkdir -p build/flatpak
	rm -rf build/flatpak/package-lock.json

	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "\
	cp package-lock.json package-lock_v3.json; \
	npm i  --lockfile-version 2 --package-lock-only; \
	mv package-lock.json package-lock_v2.json; \
	mv package-lock_v3.json package-lock.json; \
	mv package-lock_v2.json ../build/flatpak/package-lock_v2.json;"

build/flatpak/node-sources.json: build/flatpak/package-lock_v2.json
	@make -s check-image-flatpak
	mkdir -p build/flatpak
	rm -rf build/flatpak/node-sources.json

	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_FLATPAK) bash -l -c "\
	. ~/.bashrc; \
	flatpak-node-generator -o build/flatpak/node-sources.json npm build/flatpak/package-lock_v2.json;"


## WEB
lonewolf-web/public/favicon.ico: lonewolf/assets/icon.svg
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 64x64 -format ico public/favicon.ico'

lonewolf-web/public/lonewolf.png: lonewolf/assets/icon.svg
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/lonewolf.svg -resize 512x512 -format png public/lonewolf.png'

lonewolf-web/public/icon.png: lonewolf/assets/icon.svg
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 128x128 -format png public/icon.png'

## TAURI
lonewolf-tauri/src-tauri/icons/512x512-lonewolf.png: lonewolf/assets/icon.svg
	@make -s check-image-dev
	mkdir -p lonewolf-tauri/src-tauri/icons
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 512x512 -format png src-tauri/icons/512x512-lonewolf.png'
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run tauri icon -- src-tauri/icons/512x512-lonewolf.png -o src-tauri/icons'

lonewolf-tauri/public/lonewolf.png: lonewolf/assets/icon.svg
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/lonewolf.svg -resize 512x512 -format png public/lonewolf.png'

lonewolf-tauri/public/icon.png: lonewolf/assets/icon.svg
	@make -s check-image-dev
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 128x128 -format png public/icon.png'
