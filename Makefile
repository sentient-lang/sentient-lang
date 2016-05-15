PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

GRAMMAR := lib/sentient/compiler/level4Compiler/grammar.pegjs
PARSER := lib/sentient/compiler/level4Compiler/syntaxParser.js

.PHONY: all test lint build clean

all: test lint build

test: node_modules parser
	jasmine

lint: node_modules
	jshint .

node_modules:
	npm install

build: parser
	mkdir -p bin
	browserify --ignore-missing lib/sentient.js | uglifyjs > bin/sentient.js

parser: $(PARSER)

$(PARSER): $(GRAMMAR)
	pegjs $(GRAMMAR) $(PARSER)

clean:
	rm -rf node_modules
	rm -rf bin
