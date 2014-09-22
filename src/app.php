<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Silex\Application;
use Silex\Application\UrlGeneratorTrait;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use PHPCRAPI\Silex\APIServiceProvider;

class PHPCRBrowserApplication extends Application
{
    use UrlGeneratorTrait;
}

$app = new PHPCRBrowserApplication();

$app->register(new UrlGeneratorServiceProvider());
$app->register(new TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../views',
));

$app->register(new APIServiceProvider(),array(
    'phpcr_api.repositories_config' => $app->share(function() use($app){
        // A closure to delay the read of the configuration because it is not loaded yet
        return $app['phpcr_repositories'];
    }),
    'phpcr_api.mount_prefix'        => '/api'
));

$app->get('/', function (Application $app) {
    return $app->redirect('/browser');
});

$app->get('/browser/', function (Application $app) {
    return $app['twig']->render('index.html');
});

$app->error(function (\Exception $e) use ($app) {
    return $app['twig']->render(
        'error.html.twig',
        array(
            'message'   =>  $e->getMessage(),
            'code'      =>  $e->getCode()
        )
    );
});

return $app;
