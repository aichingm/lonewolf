
.PHONY: dev build lint npm-install container container-force shell

dev:
	podman run --rm -it -p 5173:5173 -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run dev -- --host'

build:
	podman run --rm -it -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run build'

lint:
	podman run --rm -it -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm run lint'

npm-install:
	podman run --rm -it -v .:/app lonewolf:build bash -c 'cd /app/lonewolf/; npm install'

container:
	cd container && podman build .. -f Dockerfile -t lonewolf:build

container-force:
	cd container && podman build --no-cache .. -f Dockerfile -t lonewolf:build

shell:
	podman run --rm -it -p 5173:5173 -v .:/app lonewolf:build bash -c 'cd /app; bash'



