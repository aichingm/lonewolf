.PHONY: check check-container-engine check-container-image clean clean-container-images contaienr-image default dev-tauri-X dev-web help lint shell-tauri shell-web test type-check 
default: help

CONTAINER_ENGINE=podman
IMAGE_DEV=lonewolf:dev
MAKE_PREFIX=$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf $(IMAGE_DEV)
MAKE_PREFIX_WEB=$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV)
MAKE_PREFIX_TAURI=$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV)

build-tauri-flatpak-sources: build/flatpak/node-sources.json build/flatpak/cargo-sources.json

build-tauri: clean-build-tauri icons-tauri check-image-dev

check:
	$(MAKE_PREFIX_WEB) make check
	$(MAKE_PREFIX_TAURI) make check

check-container-engine:
	@if \! hash $(CONTAINER_ENGINE) 1>/dev/null 2>&1; then echo "Container engine ($(CONTAINER_ENGINE)) not found\!"; exit 1;fi

check-container-image: check-container-engine
	@if [ $$(podman images -q $(IMAGE_DEV) | wc -l) == "0" ]; then echo "Container image not found. Try running 'make image-dev'.";exit 1; fi

clean:
	rm -rf flatpak
	$(MAKE_PREFIX) make clean
	$(MAKE_PREFIX_WEB) make clean
	$(MAKE_PREFIX_TAURI) make clean

clean-container-images: check-container-engine
	$(CONTAINER_ENGINE) image rm $(IMAGE_DEV) || true

dev-tauri-X:
	@make -s check-container-image
	xhost +
	$(CONTAINER_ENGINE) run --rm -it -v .:/app --net=host -e DISPLAY -v /tmp/.X11-unix -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "make dev"
	xhost -

dev-web:
	@make -s check-container-image
	$(CONTAINER_ENGINE) run --rm -it -p 5173:5173 -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) make dev

container-image: check-container-engine
	$(CONTAINER_ENGINE) build . --no-cache -f Dockerfile -t $(IMAGE_DEV)

flatpak-files: flatpak/cargo-sources.json flatpak/package-lock_v2.json flatpak/node-sources.json flatpak/icons.ts

lint:
	@make -s check-container-image
	$(MAKE_PREFIX_WEB) make lint
	$(MAKE_PREFIX_TAURI) make lint

help:
	@echo Available targets:
	@echo
	@echo -n "* "
	@echo check check-container-engine check-container-image clean clean-container-images container-image default dev-tauri-X dev-web help lint shell-tauri shell-web test type-check | sed -e "s/ /\n* /g"


shell-tauri:
	$(MAKE_PREFIX_TAURI) bash -l

shell-web:
	$(MAKE_PREFIX_WEB) bash -l

test: 
	@make -s check-container-image
	$(MAKE_PREFIX_WEB) make test
	$(MAKE_PREFIX_TAURI) make test

type-check:
	@make -s check-container-image
	$(MAKE_PREFIX_WEB) make type-check
	$(MAKE_PREFIX_TAURI) make type-check

# Files

Lonewolf.png: Lonewolf.lwp
	@make -s check-container-image
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-web $(IMAGE_DEV) bash -c 'sh -c "export VITE_IGNORE_PLATFORM_CAN_SUPPORT=1; npm run dev -- --host" & SERVER=$$!; sleep 1; export NODE_PATH=$$(npm root --quiet -g); node scripts/print.js /app/Lonewolf.lwp /app/Lonewolf.png; kill -9 $$SERVER'

flatpak/cargo-sources.json: lonewolf-tauri/src-tauri/Cargo.lock
	@make -s check-container-image
	mkdir -p flatpak
	rm -rf flatpak/cargo-sources.json
	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_DEV) bash -l -c "\
		flatpak-cargo-generator.py lonewolf-tauri/src-tauri/Cargo.lock -o flatpak/cargo-sources.json"

flatpak/package-lock_v2.json: lonewolf-tauri/package-lock.json
	@make -s check-container-image
	mkdir -p flatpak
	rm -rf flatpak/package-lock.json

	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app/lonewolf-tauri $(IMAGE_DEV) bash -l -c "\
	cp package-lock.json package-lock_v3.json; \
	npm i  --lockfile-version 2 --package-lock-only; \
	mv package-lock.json package-lock_v2.json; \
	mv package-lock_v3.json package-lock.json; \
	mv package-lock_v2.json ../flatpak/package-lock_v2.json;"

flatpak/node-sources.json: flatpak/package-lock_v2.json
	@make -s check-container-image
	mkdir -p flatpak
	rm -rf flatpak/node-sources.json

	$(CONTAINER_ENGINE) run --rm -it -v .:/app -w /app $(IMAGE_DEV) bash -l -c "\
	. ~/.bashrc; \
	flatpak-node-generator -o flatpak/node-sources.json npm flatpak/package-lock_v2.json;"

flatpak/icons.ts:
	(cd lonewolf; make icons)
	cp lonewolf/assets/icons.ts flatpak/icons.ts
