<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Provider;

use PHPCRBrowser\API\Exception\ResourceNotFoundException;
use PHPCRBrowser\PHPCR\Node;
use PHPCRBrowser\PHPCR\Session;
use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller provider for API components
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 */
class APIControllerProvider implements ControllerProviderInterface
{
    public function connect(Application $app)
    {
        $controllers = $app['controllers_factory'];
        $pathConverter = function ($path) {
            return '/'.$path;
        };

        $controllers->get('/', array($this, 'getRepositoriesAction'));

        $controllers->get('/{repository}', array($this, 'getWorkspacesAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');

        $controllers->get('/{repository}/{workspace}', array($this, 'getRootNodeAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->bind('browser_api.storage');

        $controllers->get('/{repository}/{workspace}/{path}', array($this, 'getNodeAction'))
            ->assert('path', '.*')
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->convert('path', $pathConverter);

        return $controllers;
    }

    public function getRepositoriesAction(Application $app)
    {
        $repositories = $app['phpcr_browser.phpcr.repositories']->getAll();
        $data = array();

        foreach ($repositories as $repository) {
            $data[] = array(
                'name'          =>  $repository->getName(),
                'factoryAlias'  =>  $repository->getFactoryAlias()
            );
        }

        return $app->json($data);
    }

    public function getWorkspacesAction(Session $repository, Application $app)
    {
        $data = array();
        foreach ($repository->getWorkspace()->getAccessibleWorkspaceNames() as $workspaceName) {
            $data[] = array(
                'name'  =>  $workspaceName
            );
        }

        return $app->json($data);
    }

    public function getRootNodeAction(Session $repository, $workspace, Application $app, Request $request)
    {
        $data = array();
        $currentNode = $repository->getRootNode();

        if($request->query->has('reducedTree')){
            $data['reducedTree'] = Node::getReducedTree($currentNode);
        }

        $data['name'] = '/';
        $data['path'] = $currentNode->getPath();
        $data['repository'] = $repository->getName();
        $data['workspace'] = $workspace;
        $data['children'] = array();

        foreach ($currentNode->getNodes() as $node) {
            $data['children'][] = array(
                'name'          =>  $node->getName(),
                'path'          =>  $node->getPath(),
                'children'      =>  array(),
                'hasChildren'   =>  (count($node->getNodes()) > 0)
            );
        }

        $data['hasChildren'] = (count($data['children']) > 0);

        if ($currentNode->getPath() != $repository->getRootNode()->getPath()) {
            $data['parent'] = $currentNode->getParent()->getName();
        }
        $data['nodeProperties'] = $currentNode->getPropertiesToArray();

        return $app->json($data);
    }

    public function getNodeAction(Session $repository, $workspace, $path, Application $app, Request $request)
    {
        if (!$repository->nodeExists($path)) {
            throw new ResourceNotFoundException('Unknown node');
        }
        $data = array();
        $currentNode = $repository->getNode($path);

        if($request->query->has('reducedTree')){
            $data['reducedTree'] = Node::getReducedTree($currentNode);
        }

        $data['name'] = $currentNode->getName();
        $data['path'] = $currentNode->getPath();
        $data['repository'] = $repository->getName();
        $data['workspace'] = $workspace;
        $data['children'] = array();
        foreach ($currentNode->getNodes() as $node) {
            $data['children'][] = array(
                'name'          =>  $node->getName(),
                'path'          =>  $node->getPath(),
                'children'      =>  array(),
                'hasChildren'   =>  (count($node->getNodes()) > 0)
            );
        }

        $data['hasChildren'] = (count($data['children']) > 0);

        if ($currentNode->getPath() != $repository->getRootNode()->getPath()) {
            $data['parent'] = $currentNode->getParent()->getName();
        }
        $data['nodeProperties'] = $currentNode->getPropertiesToArray();

        return $app->json($data);
    }

}
