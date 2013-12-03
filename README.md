PHPCR Browser
=============

PHPCR Browser provides web interface to explore PHPCR repositories. The current implementation supports Jackalope Jackrabbit.

![screenshot](http://marmelab.com/phpcr-browser/img/screenshot.png)

Installation
------------

To install the web application, run the following commands:

```sh
$ composer install
$ bower update
```

Add a VirtualHost to your Apache config, or better, use PHP 5.4 integrated webserver by calling:

```sh
$ php -S localhost:8000 -t web
```

Configuration
-------------

Create a `config/prod.yml` with the connection settings for the repositories you need to browser. For instance, to use the browser with a local instance of jackrabbit:

```yml
phpcr_repositories:
    'My Jackrabbit Repository':
        factory: jackalope.jackrabbit
        parameters:
            jackalope.jackrabbit_uri: 'http://localhost:8080/server'
            credentials.username: admin
            credentials.password: admin
```

The `factory` setting is the type of PHPCR repository you want to browse. See available factories in [config/factories.yml](config/factories.yml).

You can also copy the `config/prod.yml-dist` file as `config/prod.yml` to get this exact configuration.

License
-------

This application is available under the MIT License, courtesy of [marmelab](http://marmelab.com).
