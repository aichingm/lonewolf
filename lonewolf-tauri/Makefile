.PHONY: build check clean default dev icons lint npm-install tauri-icons test test-unit type-check
default: dev

build: icons
	npm run tauri build -- -b deb

check: lint type-check

clean:
	rm -rf  src-tauri/icons public/lonewolf.png public/icon.png src-tauri/target

dev:
	npm run tauri dev

icons: src-tauri/icons/512x512-lonewolf.png public/lonewolf.png public/icon.png tauri-icons
	(cd src; make icons)
	(cd src; make check)


lint:
	npm run lint

npm-install:
	npm install

tauri-icons: src-tauri/icons/512x512-lonewolf.png
	npm run tauri icon -- src-tauri/icons/512x512-lonewolf.png -o src-tauri/icons

test: test-unit

test-unit:
	npm run test:unit

type-check:
	npm run type-check

# Files

src-tauri/icons/512x512-lonewolf.png: src/assets/icon.svg
	mkdir -p src-tauri/icons
	rsvg-convert -b "#ffffff00" src/assets/icon.svg --width 512 --height 512 --output src-tauri/icons/512x512-lonewolf.png

public/lonewolf.png: src/assets/icon.svg
	rsvg-convert -b "#ffffff00" src/assets/lonewolf.svg --width 512 --height 512 --output public/lonewolf.png

public/icon.png: src/assets/icon.svg
	rsvg-convert -b "#ffffff00" src/assets/icon.svg --width 128 --height 128 --output public/icon.png

