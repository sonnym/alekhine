doc:
	./node_modules/.bin/groc "lib/*" README.md

doc_publish:
	./node_modules/.bin/groc "lib/*" README.md --gh

test:
	@NODE_ENV=test ./node_modules/.bin/nodeunit test/*

.PHONY: test doc doc_publish
