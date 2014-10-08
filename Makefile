PATH := ${CURDIR}/node_modules/.bin:${CURDIR}/node_modules/karma/bin:${PATH}
autoconfig?=true

compass-compile:
	compass compile -e production --force

compass-watch:
	compass watch

test-spec:
	karma start test/web/karma.conf.js

install:
	composer install --no-interaction
	bower install --config.interactive=false
ifneq ($(autoconfig), false)
	cp config/prod.yml-dist config/prod.yml
endif

update:
	git pull
	make install autoconfig=false

install-test:
	npm install
