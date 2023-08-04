.PHONY: build build-tauri build-web cce cci check clean clean-tauri clean-web default dev-tauri-X dev-web icons-tauri icons-web image-dev image-dev-force lint lint-tauri lint-web npm-install npm-install-tauri npm-install-web shell shell-tauri shell-web test test-tauri-unit test-web-unit type-check type-check-tauri type-check-web

default: dev-web

CONTAINER_ENGINE=podman
IMAGE_DEV=lonewolf:build
IMAGE_DEV_TARGET=lonewolf-build

image-dev: cce
	$(CONTAINER_ENGINE) build . -f Dockerfile -t $(IMAGE_DEV)

image-dev-force: cce
	$(CONTAINER_ENGINE) build --no-cache . -f Dockerfile -t $(IMAGE_DEV)

build: build-tauri build-web

build-tauri: cci icons-tauri
	rm -rf lonewolf-tauri/src-tauri/target/release/build/lonewolf*
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "npm run tauri build"

build-web: cci icons-web
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c "npm run build"

cce:
	@if \!  hash podman 1>/dev/null 2>&1; then echo "Container engine ($(CONTAINER_ENGINE)) not found\!"; exit 1;fi

cci: cce
	@if [ $$(podman images -q $(IMAGE_DEV) | wc -l) == "0" ]; then echo "Container image not found. Try running 'make image-dev'.";exit 1; fi

check: lint type-check

clean: clean-tauri clean-web

clean-tauri:
	rm -rf src-tauri/icons/*
	rm -rf lonewolf-tauri/dist
	rm -rf lonewolf-tauri/src-tauri/target

clean-web:
	rm -rf lonewolf-web/public/favicon.ico
	rm -rf lonewolf-web/dist

dev-tauri-X: cci icons-tauri
	xhost +
	$(CONTAINER_ENGINE) run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "npm run tauri dev"
	xhost -

dev-web: cci icons-web
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run dev -- --host'

icons-tauri: lonewolf-tauri/src-tauri/icons/512x521-lonewolf.png

icons-web: cci lonewolf-web/public/favicon.ico

lonewolf-tauri/src-tauri/icons/512x521-lonewolf.png: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 512x512 -format png src-tauri/icons/512x521-lonewolf.png'
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run tauri icon -- src-tauri/icons/512x521-lonewolf.png -o src-tauri/icons'

lonewolf-web/public/favicon.ico: lonewolf/assets/icon.svg
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'convert -background transparent src/assets/icon.svg -resize 64x64 -format ico public/favicon.ico'

lint: lint-web lint-tauri

lint-tauri: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run lint'

lint-web: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run lint'

npm-install: npm-install-web npm-install-tauri

npm-install-tauri: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm install'

npm-install-web: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm install'

shell: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_DEV) bash -l

shell-tauri: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash

shell-web: cci
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash

test: test-tauri-unit test-web-unit

test-tauri-unit: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run test:unit'

test-web-unit: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run test:unit'

type-check: type-check-web type-check-tauri

type-check-tauri: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -c 'npm run type-check'

type-check-web: cci
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'npm run type-check'

