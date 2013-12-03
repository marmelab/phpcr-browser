<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\PHPCR\Provider;

use Silex\Application;
use Silex\ServiceProviderInterface;

use PHPCRBrowser\PHPCR\RepositoryConfigurationLoader;
use PHPCRBrowser\PHPCR\RepositoryCollection;

/**
 * Service provider for foundation components
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 */
class PHPCRServiceProvider implements ServiceProviderInterface
{
    public function register(Application $app)
    {
        $app['phpcr_browser.phpcr.repositories'] = $app->share(function ($app) {
        	$loader = new RepositoryConfigurationLoader($app['phpcr_repositories'], $app['phpcr_factories']);
        	$repositories = $loader->getRepositories();
        	return new RepositoryCollection($repositories);
        });
    }

    public function boot(Application $app)
    {
    }
}
