PATH := ${CURDIR}/node_modules/.bin:${CURDIR}/node_modules/karma/bin:${PATH}
autoconfig?=true

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
ifneq ($(autoconfig), false)
	cp config/prod.yml-dist config/prod.yml
	cp web/assets/js/browser/config.js-dist web/assets/js/browser/config.js
endif

install-test:
	npm install
