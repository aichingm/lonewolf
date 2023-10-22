.PHONY: build check clean default icons 
default: build

build: icons

check:
	(cd assets; bash icons.sh check)

clean: 
	rm -rf assets/icons.ts assets/icons.list

icons:
	(cd assets; bash icons.sh generate)


