doc:
	./node_modules/.bin/groc -i 'lib/alekhine.js' lib/alekhine.js

doc_publish:
	./node_modules/.bin/groc -i 'lib/alekhine.js' lib/alekhine.js --gh
