<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Igorw\Silex\ConfigServiceProvider;
use PHPCRBrowser\Browser\Provider\BrowserControllerProvider;
use PHPCRBrowser\API\Provider\APIControllerProvider;
use PHPCRBrowser\API\Provider\APIServiceProvider;
use PHPCRBrowser\Browser\Provider\BrowserServiceProvider;
use PHPCRBrowser\PHPCR\Provider\PHPCRServiceProvider;
use Silex\Application;
use Silex\Application\UrlGeneratorTrait;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\SessionServiceProvider;

class PHPCRBrowserApplication extends Application
{
    use UrlGeneratorTrait;
}

$app = new PHPCRBrowserApplication();

$app->register(new SessionServiceProvider());
$app->register(new UrlGeneratorServiceProvider());
$app->register(new TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../views',
));

$app->register(new PHPCRServiceProvider());
$app->register(new APIServiceProvider());
$app->register(new BrowserServiceProvider());

$app->mount('/_api', new APIControllerProvider());
$app->mount('/browser',new BrowserControllerProvider());

$app->get('/', function (Application $app) {
    return $app->redirect(
        $app['url_generator']->generate(
        'browser.repositories'
    ));
})->bind('home');

$app->register(new ConfigServiceProvider(__DIR__."/../config/factories.yml"));

return $app;
