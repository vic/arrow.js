all: test browser
test: ./node_modules
	./node_modules/.bin/mocha
coverage: ./node_modules
	./node_modules/.bin/mocha -r blanket -R html-cov > ./test/coverage.html
browser: ./node_modules
	mkdir -p ./dist
	./node_modules/.bin/browserify -e ./arrow.js -o ./dist/arrow-browser.js
./node_modules:
	npm install
.PHONY: all test browser
