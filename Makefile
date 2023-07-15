
.PHONY: default build build-web build-tauri check container-development container-dev-force dev-tauri dev-web favicon lint lint-web lint-tauri npm-install npm-install-web npm-install-tauri shell shell-web shell-tauri type-check type-check-web type-check-tauri type-check type-check-web type-check-tauri

default: dev-web

CONTAINER_ENGINE=podman



container-build:
	$(CONTAINER_ENGINE) build . -f Dockerfile -t lonewolf:build

container-build-force:
	$(CONTAINER_ENGINE) build --no-cache . -f Dockerfile -t lonewolf:build

build: build-web build-tauri

build-web: favicon
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c "npm run build"

build-tauri:
	rm -rf lonewolf-tauri/src-tauri/target/release/build/lonewolf*
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -l -c "npm run tauri build"

dev-tauri-X:
	xhost +
	$(CONTAINER_ENGINE) run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri lonewolf:build bash -l -c "npm run tauri dev"
	xhost -

dev-web:
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run dev -- --host'

check: lint type-check

lint: lint-web lint-tauri

lint-web:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run lint'

lint-tauri:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm run lint'

npm-install: npm-install-web npm-install-tauri

npm-install-web:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm install'

npm-install-tauri:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm install'

shell:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app lonewolf:build bash -l

shell-web:
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web lonewolf:build bash

shell-tauri:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash

type-check: type-check-web type-check-tauri

type-check-web:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run type-check'

type-check-tauri:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm run type-check'

favicon:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'convert -background transparent src/assets/logo.svg -resize 64x64 -format ico public/favicon.ico'

clean-tauri:
	rm -rf lonewolf-tauri/src-tauri/target/debug/build/lonewolf-*

test: test-tauri-unit test-web-unit

test-tauri-unit:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm run test:unit'

test-web-unit:
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run test:unit'

