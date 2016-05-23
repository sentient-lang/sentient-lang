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

build: node_modules parser
	mkdir -p bin
	echo "#!/usr/bin/env node" > tmp.js
	browserify --standalone SentientCLI --node lib/sentient/cli.js >> tmp.js
	cat lib/sentient/cli/shim.before.js >> tmp.js
	browserify --standalone Sentient --ignore-missing lib/sentient.js >> tmp.js
	cat lib/sentient/cli/shim.after.js >> tmp.js
	uglifyjs tmp.js --mangle --compress > bin/sentient.js && rm tmp.js
	chmod a+x bin/sentient.js

parser: $(PARSER)

$(PARSER): $(GRAMMAR)
	pegjs --optimize size $(GRAMMAR) $(PARSER)

node_modules:
	npm install

clean:
	rm -rf node_modules
	rm -rf bin
	rm -f $(PARSER)
