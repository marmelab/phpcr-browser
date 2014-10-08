# PHPCR Browser [![Build Status](https://travis-ci.org/marmelab/phpcr-browser.svg?branch=master)](https://travis-ci.org/marmelab/phpcr-browser)

PHPCR Browser provides an intuitive web interface to explore and manage [PHPCR](http://phpcr.github.io/) repositories.
The current implementation supports [Jackalope Jackrabbit](https://github.com/jackalope/jackalope-jackrabbit) and [Jackalope Doctrine DBAL](https://github.com/jackalope/jackalope-doctrine-dbal).

![screenshot](http://marmelab.com/phpcr-browser/img/screenshot-1.2.png)

Supported Operations
---------------

**Jackalope Jackrabbit:**

 - **Workspace:** create
 - **Node:** create, delete, move
 - **Property:** create, delete, update

**Jackalope Doctrine DBAL:**

 - **Workspace:** create, delete
 - **Node:** create, delete, move
 - **Property:** create, delete, update

*See [marmelab/phpcr-api/config/factories.yml](https://github.com/marmelab/phpcr-api/blob/master/config/factories.yml) for more details.*

Installation
------------

PHPCR Browser uses [Composer](https://getcomposer.org/) and [Bower](http://bower.io/) to manage its dependencies. Make sure they are **globally installed** before continuing.

#### 1. Clone the repository
```sh
git clone git@github.com:marmelab/phpcr-browser.git
cd phpcr-browser
```

#### 2. Install dependencies and configure the browser
To install the web application with the default configuration (see below), run the following command:

```sh
make install
```

This will download all dependencies and do the [Configuration](#configuration) part for you. If you prefer do it on your own run:

```sh
make install autoconfig=false
```
---
#### Adding support for Jackalope Doctrine DBAL (Optionnal)
By default, the Jackalope Doctrine DBAL is not installed. If you want to use it run the following commands:

```sh
composer require jackalope/jackalope-doctrine-dbal:1.1.* --no-update
composer update jackalope/jackalope-doctrine-dbal
```

And update your configuration file to add your Doctrine repository by writing something equivalent to:

```yml
'My Doctrine DBAL Repository':
        factory: jackalope.doctrine-dbal
        parameters:
            doctrine_dbal.config:
                driver: pdo_sqlite
                path: ../src/app.db
            credentials.username: admin
            credentials.password: admin
```

For more details on `doctrine_dbal.config` see [Doctrine website](http://doctrine-dbal.readthedocs.org/en/latest/reference/configuration.html).

You can also find this config into `config/prod-with-dbal.yml.dist`

Note you can install and use both Jackalope Jackrabbit and Doctrine DBAL at the same time.

You can add as many repositories as you want into your config file.

Configuration
-------------
Create a `config/prod.yml` with the connection settings for the repositories you need to browse. For instance, to use the browser with a local instance of Jackalope Jackrabbit:

```yml
phpcr_repositories:
    'My Jackrabbit Repository':
        factory: jackalope.jackrabbit
        parameters:
            jackalope.jackrabbit_uri: 'http://localhost:8080/server'
            credentials.username: admin
            credentials.password: admin
```

The `factory` setting is the type of PHPCR repository you want to browse. See available factories in [marmelab/phpcr-api/config/factories.yml](https://github.com/marmelab/phpcr-api/blob/master/config/factories.yml).

You can also copy the `config/prod.yml-dist` file as `config/prod.yml` to get this exact configuration.

For using Jackalope Doctrine DBAL refer to [Installation](#installation).

Usage
-----

####Using Apache VirtualHost

Add a VirtualHost to your Apache config (and add in it 'AllowEncodedSlashes On'):

```
<VirtualHost *:80>
  DocumentRoot /path/to/the/browser/web
  ServerName phpcr-browser.lo
  AllowEncodedSlashes On
</VirtualHost>
```
And update your `/etc/hosts` file by adding:

```
127.0.0.1   phpcr-browser.lo
```

You can now access to the browser on `http://phpcr-browser.lo` (or equivalent domain as configured in your virtual host and hosts file).

####Using PHP 5.4 integrated webserver

You can also use PHP 5.4 integrated webserver by calling:

```sh
$ php -S localhost:8000 -t web
```

Alternatively call:

```sh
$ bin/run.sh
```

You can now access the repository by browsing to http://localhost:8000/browser.

Tests
-----

The PHPCR Browser AngularJS part is fully unit tested with [Karma](http://karma-runner.github.io/) and [Jasmine](http://jasmine.github.io/).
If you want to run them, install dependencies by running: `make install-test`

Then run the following command: `make test-spec`

Sass
----

The stylesheets are compiled by [Compass](http://compass-style.org/) and [Sass](http://sass-lang.com/).

If you update the sass files, run `make compass-watch` during development.

When your work is done, run `make compass-compile` before committing.

Contributing
---------

All contributions are welcome and must pass the tests. If you add a new feature, write tests for it.

License
-------

This application is available under the MIT License, courtesy of [marmelab](http://marmelab.com).
