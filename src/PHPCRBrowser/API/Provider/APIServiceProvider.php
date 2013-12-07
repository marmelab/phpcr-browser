<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Provider;

use PHPCRBrowser\API\Exception\ExceptionInterface;
use PHPCRBrowser\API\Converter\RepositoryConverter;
use Silex\Application;
use Silex\ServiceProviderInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Service provider for browser components
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 */
class APIServiceProvider implements ServiceProviderInterface
{
    public function register(Application $app)
    {
        $app['phpcr_browser.browser_api.repository_converter'] = $app->share(function($app) {
            return new RepositoryConverter($app['phpcr_browser.phpcr.repositories']);
        });
    }

    public function boot(Application $app)
    {
        // To accept json payload
        $app->before(function (Request $request) {
            if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
                $data = json_decode($request->getContent(), true);
                $request->request->replace(is_array($data) ? $data : array());
            }
        });

        $app->error(function (ExceptionInterface $e) use ($app) {
            return $app->json(
                ['message' => $e->getMessage()],
                404 /* ignored */,
                array('X-Status-Code' => $e->getCode())
            );
        });
    }
}
