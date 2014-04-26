all: test browser
test:
	./node_modules/.bin/mocha
coverage:
	./node_modules/.bin/mocha -r blanket -R html-cov > ./test/coverage.html
browser:
	mkdir -p ./dist
	./node_modules/.bin/browserify -e ./arrow.js -o ./dist/arrow-browser.js
.PHONY: all test browser
