
.PHONY: default build build-web build-tauri check container container-force dev-tauri dev-web favicon lint lint-web lint-tauri npm-install npm-install-web npm-install-tauri shell shell-web shell-tauri type-check type-check-web type-check-tauri type-check type-check-web type-check-tauri

default: dev-web



container:
	podman build . -f Dockerfile -t lonewolf:build

container-force:
	podman build --no-cache . -f Dockerfile -t lonewolf:build

build: build-web build-tauri

build-web:
	podman run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c "npm run build"

build-tauri:
	rm -rf lonewolf-tauri/src-tauri/target/release/build/lonewolf*
	podman run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -l -c "npm run tauri build"

dev-tauri-X:
	xhost +
	podman run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri lonewolf:build bash -l -c "npm run tauri dev"
	xhost -

dev-web:
	podman run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run dev -- --host'

check: lint type-check

lint: lint-web lint-tauri

lint-web:
	podman run --rm -t -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run lint'

lint-tauri:
	podman run --rm -t -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm run lint'

npm-install: npm-install-web npm-install-tauri

npm-install-web:
	podman run --rm -t -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm install'

npm-install-tauri:
	podman run --rm -t -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm install'

shell:
	podman run --rm -it -v .:/app -w /app lonewolf:build bash -l

shell-web:
	podman run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web lonewolf:build bash

shell-tauri:
	podman run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash

type-check: type-check-web type-check-tauri

type-check-web:
	podman run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run type-check'

type-check-tauri:
	podman run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm run type-check'

favicon:
	podman run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'convert -background transparent src/assets/logo.svg -resize 64x64 -format ico public/favicon.ico'

clean-tauri:
	rm -rf lonewolf-tauri/src-tauri/target/debug/build/lonewolf-*

test: test-tauri-unit test-web-unit

test-tauri-unit:
	podman run --rm -it -v .:/app -w /app/lonewolf-tauri lonewolf:build bash -c 'npm run test:unit'

test-web-unit:
	podman run --rm -it -v .:/app -w /app/lonewolf-web lonewolf:build bash -c 'npm run test:unit'

