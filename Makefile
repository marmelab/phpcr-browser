PATH := ${CURDIR}/node_modules/.bin:${CURDIR}/node_modules/karma/bin:${PATH}
autoconfig?=true

compass-compile:
	compass compile -e production --force sass/screen.scss

compass-watch:
	compass watch sass/screen.scss

test-spec:
	karma start test/web/karma.conf.js

install:
	composer install --no-interaction
	bower install --config.interactive=false
ifneq ($(autoconfig), false)
	cp config/prod.yml-dist config/prod.yml
endif

install-gaudi:
	gaudi run composer install
	gaudi run npm install
	gaudi run bower install
ifneq ($(autoconfig), false)
	cp config/prod.yml-dist config/prod.yml
endif
	gaudi

update:
	git pull
	make install autoconfig=false

update-gaudi:
	git pull
	make install-gaudi autoconfig=false

install-test:
	npm install

install-test-gaudi:
	gaudi npm install
