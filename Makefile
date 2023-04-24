
.PHONY: default build check container container-force dev lint npm-install shell shell-light type-check

default: dev

build:
	podman run --rm -t -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run build'

check: lint type-check

container:
	cd container && podman build .. -f Dockerfile -t lonewolf:build

container-force:
	cd container && podman build --no-cache .. -f Dockerfile -t lonewolf:build

dev:
	podman run --rm -it -p 5173:5173 -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run dev -- --host'

lint:
	podman run --rm -t -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run lint '

npm-install:
	podman run --rm -t -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm install'

shell:
	podman run --rm -it -p 5173:5173 -v .:/app lonewolf:build bash -c 'cd /app; bash'

shell-light:
	podman run --rm -it -v .:/app lonewolf:build bash -c 'cd /app; bash'

type-check:
	podman run --rm -t -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run type-check'

icons:
	podman run --rm -it -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; convert -background transparent src/assets/logo.svg -resize 64x64 -format ico public/favicon.ico'


