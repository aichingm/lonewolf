.PHONY: build check clean default icons
default: build

build: icons

check:
	(cd assets; node icons.script.mjs check)

clean:
	rm -rf assets/icons.ts

icons:
	(cd assets; node icons.script.mjs generate)


