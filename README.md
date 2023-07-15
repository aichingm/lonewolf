# Lonewolf

Lonewolf is a personal kanban board application which lets you work on you own projects with a great desktop experience.


## Development Setup

It seams you are interested in the development of lonewolf, GREAT! Lonewolf is written in typescript, build with vue 3 and uses naiveUI as ui toolkit. 
The desktop version of Lonewolf is build on top of tauri (a more light weight version of electron written in rust). 

Lonewolf uses make as build tool, so everything you might want to run is implemented as a make target. 
To run most of the make targets only a podman (default) compatible (eg. docker) container engine is needed.

To build the development container run

```
make container-dev
```

This image is needed by most make targets, so make sure it is build before running running any of them.


## Live Development

Lonewolf can be run in to versions a web and a tauri version.

The web version can be accessed from a web browser and supports hot reloading
```
make dev-web
```

The tauri development version needs to be run on linux with a running Xorg server. Since this runs lonewolf in a container not everything works as it would when running locally (eg. opening attachments calls xdg-open in the background but this is not available within the container)

**Also make sure that `xhost` is installed!**

## Validation

To validate the functionality of your changes you can and should run

```
make check test
```

to run linting, type checks and unit tests.

There are also targets to only run validation for the web or the tauri version:

```
make lint-web type-check-web test-web-unit
```

```
make lint-tauri type-check-tauri test-tauri-unit
```

## Building

Building the web version

```
make build-web
```

Building the tauri version

```
make build-tauri
```

## Other

There are a few other targets to help you developing

### Installing node modules
```
make npm-install
```
### Running a shell in the container
```
make shell
```
