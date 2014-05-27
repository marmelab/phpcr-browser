# PHPCR Browser [![Build Status](https://travis-ci.org/marmelab/phpcr-browser.svg?branch=master)](https://travis-ci.org/marmelab/phpcr-browser)

PHPCR Browser provides web interface to explore PHPCR repositories. The current implementation supports Jackalope Jackrabbit and Doctrine DBAL.

You can create/delete a workspace (if supported by the repository), add/delete/move nodes, add/edit/delete properties.

![screenshot](http://marmelab.com/phpcr-browser/img/phpcr-browser-screencast.gif)

Installation
------------

You need to have installed globally [Composer](https://getcomposer.org/) and [Bower](http://bower.io/).

To install the web application with the default configuration (see below), run the following command into the browser root dir:

```sh
$ make install
```

This will do the [Configuration](#Configuration) part for you. If you prefer do it on your own run:

```sh
$ make install autoconfig=false
```

You can also use [gaudi](http://gaudi.io) to install PHPCR Browser:

```sh
$ make install-gaudi
# or
$ make install-gaudi autoconfig=false
```

In order to use Jackalope Doctrine DBAL now run the following:

```sh
$ composer require jackalope/jackalope-doctrine-dbal:1.1.* --no-update
$ composer update jackalope/jackalope-doctrine-dbal
```

Note you can install and use both Jackalope Jackrabbit and Doctrine DBAL at the same time.

Update
------

To update the browser do a `git checkout` to the branch you want and `git pull`. Then run `make install autoconfig=false`.

Configuration
-------------
Create a `config/prod.yml` with the connection settings for the repositories you need to browse. For instance, to use the browser with a local instance of jackrabbit:

```yml
phpcr_repositories:
    'My Jackrabbit Repository':
        factory: jackalope.jackrabbit
        parameters:
            jackalope.jackrabbit_uri: 'http://localhost:8080/server'
            credentials.username: admin
            credentials.password: admin
    'My Doctrine DBAL Repository':
        factory: jackalope.doctrine-dbal
        parameters:
            doctrine_dbal.config:
                driver: pdo_sqlite
                path: ../src/app.db
            credentials.username: admin
            credentials.password: admin
```

The `factory` setting is the type of PHPCR repository you want to browse. See available factories in [marmelab/phpcr-api/config/factories.yml](https://github.com/marmelab/phpcr-api/blob/master/config/factories.yml).

You can also copy the `config/prod.yml-dist` file as `config/prod.yml` to get this exact configuration.

Copy also the angular app config dist file :

```
cp web/assets/js/browser/config.js-dist web/assets/js/browser/config.js
```

Usage
-----

Add a VirtualHost to your Apache config (and add in it 'AllowEncodedSlashes On'), or use PHP 5.4 integrated webserver by calling:

```sh
$ php -S localhost:8000 -t web
```

Alternatively call:

```sh
$ bin/run.sh
```

You can now access the repository by browsing to http://localhost:8000/browser (or equivalent domain as configured in your virtual host).

Tests
-----

Before running tests, install dependencies by running: `make install-test`

Then run the following command: `make test`

Sass
----

If you update the sass files, run `make compass-watch` for development. When your work is done, run `make compass-compile`.

License
-------

This application is available under the MIT License, courtesy of [marmelab](http://marmelab.com).

Favicon by [Stephen Hutchings](http://typicons.com/) ([Found on iconfinder](https://www.iconfinder.com/icons/216194/eye_icon#size=32))
