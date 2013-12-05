<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Provider;

use PHPCRBrowser\API\Exception\ResourceNotFoundException;
use PHPCRBrowser\API\Exception\AccessDeniedException;
use PHPCRBrowser\API\Exception\NotSupportedOperationException;
use PHPCRBrowser\API\Exception\InternalServerErrorException;
use PHPCRBrowser\PHPCR\Node;
use PHPCRBrowser\PHPCR\Session;
use PHPCR\UnsupportedRepositoryOperationException;
use PHPCR\NoSuchWorkspaceException;
use PHPCR\RepositoryException;
use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller provider for API components
 *
 * @author  Robin Bressan <robin@marmelab.comn>
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
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');

        $controllers->get('/{repository}/{workspace}/{path}', array($this, 'getNodeAction'))
            ->assert('path', '.*')
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->convert('path', $pathConverter);

         $controllers->post('/{repository}', array($this, 'createWorkspaceAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');

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
            $data[$workspaceName] = array(
                'name'  =>  $workspaceName
            );
        }
        ksort($data);

        return $app->json(array_values($data));
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

    public function createWorkspaceAction(Session $repository, Application $app, Request $request)
    {
        $name = $request->request->get('name', null);
        $srcWorkspace = $request->request->get('srcWorkspace', null);

        $currentWorkspace = $repository->getWorkspace();

        if(is_null($name) || mb_strlen($name) == 0){
            throw new InternalServerErrorException('Workspace name is empty');
        }elseif(in_array($name, $currentWorkspace->getAccessibleWorkspaceNames())){
            throw new InternalServerErrorException(sprintf('Workspace %s already exists', $name));
        }

        try{
            $currentWorkspace->createWorkspace($name, $srcWorkspace);
        }catch(\PHPCR\AccessDeniedException $e){
            throw new AccessDeniedException('Invalid credentials');
        }catch(UnsupportedRepositoryOperationException $e){
            if(is_null($srcWorkspace)){
                throw new NotSupportedOperationException('Repository does not support workspace creation');
            }else{
                throw new NotSupportedOperationException('Repository does not support workspace cloning');
            }
        }catch(NoSuchWorkspaceException $e){
            throw new ResourceNotFoundException('Unknown referenced workspace');
        }catch(RepositoryException $e){
            throw new ResourceNotFoundException($e->getMessage());
        }
       
        return $app->json(sprintf('Workspace %s created', $name));
    }

}
