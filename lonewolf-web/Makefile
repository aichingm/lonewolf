.PHONY: build check clean default dev icons lint npm-install test test-unit type-check
default: dev

build: icons
	npm run build

check: lint type-check

clean:
	rm -rf public/favicon.ico public/lonewolf.png public/icon.png dist

dev: 
	npm run dev -- --host

icons: public/favicon.ico public/lonewolf.png public/icon.png
	(cd src; make icons)
	(cd src; make check)

lint:
	npm run lint

npm-install:
	npm install

test: test-unit

test-unit:
	npm run test:unit

type-check:
	npm run type-check

# Files

public/favicon.ico: src/assets/icon.svg
	rsvg-convert -b "#ffffff00" src/assets/icon.svg --width 64 --height 64 --output public/favicon.png

public/lonewolf.png: src/assets/icon.svg
	rsvg-convert -b "#ffffff00" src/assets/lonewolf.svg --width 512 --height 512 --output public/lonewolf.png

public/icon.png: src/assets/icon.svg
	rsvg-convert -b "#ffffff00" src/assets/icon.svg --width 128 --height 128 --output public/icon.png
