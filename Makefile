PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

.PHONY: all test lint clean

all: test lint

test: node_modules
	jasmine

lint: node_modules
	jshint .

node_modules:
	npm install

build:
	mkdir -p bin
	browserify lib/sentient.js > bin/sentient.js

clean:
	rm -rf node_modules
	rm -rf bin
