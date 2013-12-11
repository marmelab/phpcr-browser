<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\Browser\Provider;

use PHPCRBrowser\Browser\Exception\APINotAvailableException;
use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;


/**
 * Controller provider for browser components
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 */
class BrowserControllerProvider implements ControllerProviderInterface
{
    public function connect(Application $app)
    {
        $controllers = $app['controllers_factory'];

        $controllers->get('/', array($this, 'getRepositoriesAction'))
            ->bind('browser.repositories');
        
        $controllers->get('/{repository}', array($this, 'getWorkspacesAction'))
            ->bind('browser.workspaces');

        $controllers->get('/{repository}/{workspace}', array($this, 'getRootNodeAction'))
            ->bind('browser.rootNode');

        $pathConverter = function ($path) {
            return '/'.$path;
        };

        $controllers->get('/{repository}/{workspace}/{path}', array($this, 'getNodeAction'))
            ->assert('path', '.*')
            ->convert('path', $pathConverter)        
            ->bind('browser.node');


        $controllers->post('/_create/{repository}', array($this, 'createWorkspaceAction'))
            ->bind('browser.workspace.create');

        $controllers->post('/_delete/{repository}/{workspace}', array($this, 'deleteWorkspaceAction'))
            ->bind('browser.workspace.delete');

        return $controllers;
    }

    public function getRepositoriesAction(Application $app, Request $request)
    {
        $apiRequest = Request::create('/api/repositories', 'GET');
        $response = $app->handle($apiRequest, HttpKernelInterface::SUB_REQUEST, true);
        $json = json_decode($response->getContent(), true);

        if (!($response->getStatusCode() == 200 && !is_null($json))) {
            throw new APINotAvailableException('API is not responding');
        }

        return $app['twig']->render('index.html.twig', array(
            'repositories'  =>  $json['repositories']
        ));
    }

    public function getWorkspacesAction($repository, Application $app, Request $request)
    {
        $apiRequest = Request::create(sprintf('/api/repositories/%s/workspaces', $repository), 'GET');
        $response = $app->handle($apiRequest, HttpKernelInterface::SUB_REQUEST, true);
        $json = json_decode($response->getContent(), true);
        
        if (!($response->getStatusCode() == 200 && !is_null($json))) {
            if ($response->getStatusCode() == 404) {
                $app['session']->getFlashBag()->add('error', sprintf('Repository %s does not exist', $repository));
            } else {
                $app['session']->getFlashBag()->add('error', sprintf('Repository %s is not available', $repository));
            }

            return $app->redirect($app->path('browser.repositories'));
        }

        return $app['twig']->render('repository.html.twig', array(
            'repository'    =>  $repository,
            'data'    =>  $json
        ));
    }

    public function getRootNodeAction($repository, $workspace, Application $app)
    {
        $apiRequest = Request::create(sprintf('/api/repositories/%s/workspaces/%s/nodes', $repository, $workspace), 'GET');
        $response = $app->handle($apiRequest, HttpKernelInterface::SUB_REQUEST, true);
        $json = json_decode($response->getContent(), true);

        if (!($response->getStatusCode() == 200 && !is_null($json))) {
            if ($response->getStatusCode() == 404) {
                $app['session']->getFlashBag()->add('error', sprintf('Workspace %s does not exist', $workspace));
            } else {
                $app['session']->getFlashBag()->add('error', sprintf('Workspace %s is not available', $workspace));
            }

            return $app->redirect($app->path('browser.workspaces', array(
                'repository' => $repository
            )));
        }

        return $app['twig']->render('workspace.html.twig', array(
            'workspace'     =>  $workspace,
            'repository'    =>  $repository,
            'currentNode'   =>  $json,
            'path'          =>  '/'
        ));
    }

    public function getNodeAction($repository, $workspace, $path, Application $app, Request $request)
    {
        $apiRequest = Request::create(sprintf('/api/repositories/%s/workspaces/%s/nodes%s', $repository, $workspace, $path), 'GET');
        $response = $app->handle($apiRequest, HttpKernelInterface::SUB_REQUEST, true);
        $json = json_decode($response->getContent(), true);

        if (!($response->getStatusCode() == 200 && !is_null($json))) {
            if ($response->getStatusCode() == 404) {
                $app['session']->getFlashBag()->add('error', sprintf('Node %s does not exist', $path));
            } else {
                $app['session']->getFlashBag()->add('error', sprintf('Node %s is not available', $path));
            }

            return $app->redirect($app->path('browser.rootNode', array(
                'repository' => $repository,
                'workspace' => $workspace
            )));
        }

        return $app['twig']->render('workspace.html.twig', array(
            'workspace'     =>  $workspace,
            'repository'    =>  $repository,
            'path'          =>  $path,
            'currentNode'   =>  $json
        ));
    }

    public function createWorkspaceAction($repository, Application $app, Request $request)
    {
        $apiRequest = Request::create(sprintf('/api/repositories/%s/workspaces', $repository), 'POST', array(
            'name'          =>  $request->request->get('name',null),
            'srcWorkspace'  =>  $request->request->get('srcWorkspace',null) != '-1' ? $request->request->get('srcWorkspace',null) : null
        ));
        $response = $app->handle($apiRequest, HttpKernelInterface::SUB_REQUEST, true);
        $json = json_decode($response->getContent(), true);

        if (!($response->getStatusCode() == 200 && !is_null($json))){
            $app['session']->getFlashBag()->add('error', $json['message']);
        }else{
            $app['session']->getFlashBag()->add('success', $json);
        }

        return $app->redirect($app->path('browser.workspaces', array(
            'repository' => $repository
        )));
    }

    public function deleteWorkspaceAction($repository, $workspace, Application $app, Request $request)
    {
        $apiRequest = Request::create(sprintf('/api/repositories/%s/workspaces/%s', $repository, $workspace), 'DELETE');
        $response = $app->handle($apiRequest, HttpKernelInterface::SUB_REQUEST, true);
        $json = json_decode($response->getContent(), true);

        if (!($response->getStatusCode() == 200 && !is_null($json))){
            $app['session']->getFlashBag()->add('error', $json['message']);
        }else{
            $app['session']->getFlashBag()->add('success', $json);
        }

        return $app->redirect($app->path('browser.workspaces', array(
            'repository' => $repository
        )));
    }

}
