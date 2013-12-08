<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\Browser\Provider;

use Silex\Application;
use Silex\ServiceProviderInterface;

/**
 * Service provider for browser components
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 */
class BrowserServiceProvider implements ServiceProviderInterface
{
    public function register(Application $app)
    {
    }

    public function boot(Application $app)
    {
    	$app->error(function (\Exception $e) use ($app) {
            return $app['twig']->render(
            	'error.html.twig',
            	array(
                    'message'   =>  $e->getMessage(),
                    'code'      =>  $e->getCode()
            	)
            );
        });
    }
}
