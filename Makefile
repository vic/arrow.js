test:
	./node_modules/.bin/mocha
coverage:
	./node_modules/.bin/mocha -r blanket -R html-cov > ./test/coverage.html
.PHONY: test
