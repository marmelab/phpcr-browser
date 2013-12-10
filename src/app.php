<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Igorw\Silex\ConfigServiceProvider;
use PHPCRBrowser\Browser\Provider\BrowserControllerProvider;
use PHPCRBrowser\Browser\Provider\BrowserServiceProvider;
use Silex\Application;
use Silex\Application\UrlGeneratorTrait;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\SessionServiceProvider;
use PHPCRAPI\Silex\APIServiceProvider;

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

$app->register(new BrowserServiceProvider());

$app->register(new APIServiceProvider(),array(
	'phpcr_api.repositories_config'	=>	$app->share(function() use($app){ 
		// A closure to delay the read of the configuration because it is not loaded yet
		return $app['phpcr_repositories']; 
	}),
	'phpcr_api.mount_prefix'	=>	'/_api'
));
$app->mount('/browser',new BrowserControllerProvider());

$app->get('/', function (Application $app) {
    return $app->redirect(
        $app['url_generator']->generate(
        'browser.repositories'
    ));
})->bind('home');

return $app;
