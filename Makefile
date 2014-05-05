PATH := ${CURDIR}/node_modules/.bin:${CURDIR}/node_modules/karma/bin:${PATH}

compass-compile:
	compass compile -e production --force sass/screen.scss

compass-watch:
	compass watch sass/screen.scss

test:
	karma start config/karma.conf.js

install:
	composer install --no-interaction
	npm install
	bower install --config.interactive=false

install-test:
	npm install
