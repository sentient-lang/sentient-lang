PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

GRAMMAR := lib/sentient/compiler/level4Compiler/grammar.pegjs
PARSER := lib/sentient/compiler/level4Compiler/pegParser.js
TARGET := /usr/local/bin/

.PHONY: all test lint build clean

all: test lint build

test: node_modules parser
	jasmine

lint: node_modules
	jshint .

build: node_modules parser
	mkdir -p bin
	browserify --standalone SentientCLI --node lib/sentient/cli.js > tmp.js
	cat lib/sentient/cli/shim.before.js >> tmp.js
	browserify --standalone Sentient --ignore-missing lib/sentient.js >> tmp.js
	cat lib/sentient/cli/shim.after.js >> tmp.js
	uglifyjs tmp.js --mangle --compress > bin/sentient.js && rm tmp.js

parser: $(PARSER)

$(PARSER): $(GRAMMAR)
	pegjs --optimize size $(GRAMMAR) $(PARSER)

node_modules:
	npm install

clean:
	rm -rf node_modules
	rm -rf bin
	rm -f $(PARSER)

lingeling:
	wget http://fmv.jku.at/lingeling/lingeling-bal-2293bef-151109.tar.gz && \
	tar xfz lingeling-bal-2293bef-151109.tar.gz && \
	pushd lingeling-bal-2293bef-151109 && ./configure.sh && make && popd && \
	cp lingeling-bal-2293bef-151109/lingeling $(TARGET) && \
	rm -rf lingeling-bal-2293bef-151109*

riss:
	wget http://tools.computational-logic.org/content/riss/Riss.tar.gz && \
	tar xzf Riss.tar.gz && pushd Riss && \
	wget https://git.io/vrQxX -O riss-427-mac-os-x.patch && \
	patch -p1 < riss-427-mac-os-x.patch && make && make coprocessorRS && \
	cp riss $(TARGET) && cp coprocessor $(TARGET) && popd && \
	rm -rf Riss Riss.tar.gz
