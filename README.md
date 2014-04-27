PHPCR Browser
=============

PHPCR Browser provides web interface to explore PHPCR repositories. The current implementation supports Jackalope Jackrabbit.

You can create/delete a workspace (if supported by the repository), add/delete/move nodes, add/edit/delete properties.

![screenshot](http://marmelab.com/phpcr-browser/img/screenshot.png)

Installation
------------

To install the web application, run the following commands:

```sh
$ composer install
$ bower install
```

Create a `config/prod.yml` with the connection settings for the repositories you need to browse. For instance, to use the browser with a local instance of jackrabbit:

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

Copy also the angular app config dist file :

```
cp web/assets/js/browser/config.js-dist web/assets/js/browser/config.js
```

Add a VirtualHost to your Apache config (and add in it 'AllowEncodedSlashes On'), or use PHP 5.4 integrated webserver by calling:

```sh
$ php -S localhost:8000 -t web
```

You can now access the repository by browsing to http://localhost:8000/browser (or equivalent domain as configured in your virtual host).

Tests
-----

To run tests, run the following command: `make tests`

License
-------

This application is available under the MIT License, courtesy of [marmelab](http://marmelab.com).

Favicon by [Stephen Hutchings](http://typicons.com/) [Found on iconfinder](https://www.iconfinder.com/icons/216194/eye_icon#size=32)
