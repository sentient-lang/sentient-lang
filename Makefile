PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

GRAMMAR := lib/sentient/compiler/level4Compiler/grammar.pegjs
PARSER := lib/sentient/compiler/level4Compiler/pegParser.js

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
	browserify --standalone SentientCLI --node lib/sentient/cli.js > tmp.js
	cat lib/sentient/cli/shim.before.js >> tmp.js
	browserify --standalone Sentient --ignore-missing -t brfs lib/sentient.js >> tmp.js
	cat lib/sentient/cli/shim.after.js >> tmp.js
	uglifyjs tmp.js --mangle --compress > bin/sentient.js && rm tmp.js

parser: $(PARSER)

$(PARSER): $(GRAMMAR)
	pegjs --optimize size $(GRAMMAR) $(PARSER)

clean:
	rm -rf node_modules
	rm -rf bin
	rm $(PARSER)
