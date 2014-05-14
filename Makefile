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
	bower install --config.interactive=false
ifneq ($(autoconfig), false)
	cp config/prod.yml-dist config/prod.yml
endif
	cp web/assets/js/browser/config.js-dist web/assets/js/browser/config.js

install-gaudi:
	gaudi run composer install --no-interaction
	gaudi run bower install --config.interactive=false
ifneq ($(autoconfig), false)
	cp config/prod.yml-dist config/prod.yml
endif
	cp web/assets/js/browser/config.js-dist web/assets/js/browser/config.js
	gaudi

install-test:
	npm install

install-test-gaudi:
	npm install
	gaudi

self-update:
	git fetch --tags
	git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
	make install autoconfig=false

self-update-gaudi:
	git fetch --tags
	git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
	make install-gaudi autoconfig=false
