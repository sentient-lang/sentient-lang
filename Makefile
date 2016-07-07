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
	rm -rf bin && mkdir bin
	browserify --standalone Sentient lib/sentient.js | uglifyjs --mangle --compress > bin/sentient.js

parser: $(PARSER)

$(PARSER): $(GRAMMAR)
	pegjs --optimize size $(GRAMMAR) $(PARSER)

node_modules:
	npm install

clean:
	rm -rf node_modules
	rm -rf bin
	rm -rf $(PARSER)
	rm -rf riss-427 Riss.tar.gz*
	rm -rf lingeling-bal-2293bef-151109*

lingeling-mac:
	brew tap sentient-lang/lingeling
	brew install lingeling

lingeling-linux:
	wget http://fmv.jku.at/lingeling/lingeling-bal-2293bef-151109.tar.gz && \
	tar xfz lingeling-bal-2293bef-151109.tar.gz && \
	pushd lingeling-bal-2293bef-151109 && ./configure.sh && make && popd && \
	cp lingeling-bal-2293bef-151109/lingeling $(TARGET) && \
	rm -rf lingeling-bal-2293bef-151109*

riss-mac:
	brew tap sentient-lang/riss
	brew install riss

riss-linux:
	wget http://tools.computational-logic.org/content/riss/Riss.tar.gz && \
	tar xzf Riss.tar.gz && mv Riss riss-427 && pushd riss-427 && \
	make && make coprocessorRS && popd && \
	cp riss-427/riss $(TARGET) && \
	cp riss-427/coprocessor $(TARGET) && \
	rm -rf riss-427 Riss.tar.gz

count:
	find lib -name '*.js' | grep -v pegParser | xargs wc -l | grep total
	find spec -name '*.js' | xargs wc -l | grep total
