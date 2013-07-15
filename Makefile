doc:
	./node_modules/.bin/groc -i 'lib/alekhine.js' lib/alekhine.js

doc_publish:
	./node_modules/.bin/groc -i 'lib/alekhine.js' lib/alekhine.js --gh

test:
	@NODE_ENV=test ./node_modules/.bin/nodeunit test/*

.PHONY: test doc doc_publish
