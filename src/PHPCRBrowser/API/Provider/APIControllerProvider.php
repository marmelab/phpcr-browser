<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Provider;

use PHPCRBrowser\API\Exception\AccessDeniedException;
use PHPCRBrowser\API\Exception\InternalServerErrorException;
use PHPCRBrowser\API\Exception\NotSupportedOperationException;
use PHPCRBrowser\API\Exception\ResourceConstraintViolationException;
use PHPCRBrowser\API\Exception\ResourceLockedException;
use PHPCRBrowser\API\Exception\ResourceNotFoundException;
use PHPCRBrowser\PHPCR\Node;
use PHPCRBrowser\PHPCR\Session;
use PHPCR\Lock\LockException;
use PHPCR\NodeType\ConstraintViolationException;
use PHPCR\NoSuchWorkspaceException;
use PHPCR\PathNotFoundException;
use PHPCR\RepositoryException;
use PHPCR\UnsupportedRepositoryOperationException;
use PHPCR\ValueFormatException;
use PHPCR\Version\VersionException;
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

        // Workspace management
        $controllers->post('/{repository}', array($this, 'createWorkspaceAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');

        $controllers->delete('/{repository}', array($this, 'deleteWorkspaceAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');


        // Property management
        $controllers->delete('/{repository}/{workspace}/{path}@{property}', array($this, 'deleteNodePropertyAction'))
            ->assert('path', '.*')
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->convert('path', $pathConverter);

        $controllers->post('/{repository}/{workspace}/{path}', array($this, 'addNodePropertyAction'))
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
        $repositorySupport = $repository->getSupport();
        $workspaceSupport = array();

        foreach($repositorySupport as $support){
            if(substr($support, 0, strlen('workspace.')) == 'workspace.'){
                $workspaceSupport[] = $support;
            }
        }

        $data = array(
            'workspaces' => array(),
            'support'    => $workspaceSupport
        );

        foreach ($repository->getWorkspace()->getAccessibleWorkspaceNames() as $workspaceName) {
            $data['workspaces'][$workspaceName] = array(
                'name'      =>  $workspaceName
            );
        }
        ksort($data['workspaces']);
        $data['workspaces'] = array_values($data['workspaces']);
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

    public function deleteWorkspaceAction(Session $repository, Application $app, Request $request)
    {
        $name = $request->request->get('name', null);

        $currentWorkspace = $repository->getWorkspace();

        if(is_null($name) || mb_strlen($name) == 0){
            throw new InternalServerErrorException('Workspace name is empty');
        }

        try{
            $currentWorkspace->deleteWorkspace($name);
        }catch(\PHPCR\AccessDeniedException $e){
            throw new AccessDeniedException('Invalid credentials');
        }catch(UnsupportedRepositoryOperationException $e){
            throw new NotSupportedOperationException('Repository does not support workspace deletion. Maybe you should delete its folder.');
        }catch(NoSuchWorkspaceException $e){
            throw new ResourceNotFoundException(sprintf('Workspace %s does not exist', $name));
        }catch(RepositoryException $e){
            throw new ResourceNotFoundException($e->getMessage());
        }
       
        return $app->json(sprintf('Workspace %s deleted', $name));
    }

    public function deleteNodePropertyAction(Session $repository, $workspace, $path, $property, Application $app, Request $request)
    {
        if (!$repository->nodeExists($path)) {
            throw new ResourceNotFoundException('Unknown node');
        }
    
        $currentNode = $repository->getNode($path);
        $propertyName = $property;
        try{
            $property = $currentNode->getProperty($property);
            $property->remove();
            $repository->save();
        }catch(PathNotFoundException $e){
            throw new ResourceNotFoundException(sprintf('Property %s does not exist', $property));
        }catch(RepositoryException $e){
            throw new ResourceNotFoundException($e->getMessage());
        }catch(\InvalidArgumentException $e){
            throw new InternalServerErrorException($e->getMessage());
        }
       
        return $app->json(sprintf('Property %s deleted', $propertyName));
    }

    public function addNodePropertyAction(Session $repository, $workspace, $path, Application $app, Request $request)
    {
        if (!$repository->nodeExists($path)) {
            throw new ResourceNotFoundException('Unknown node');
        }
    
        $currentNode = $repository->getNode($path);
        var_dump($request->request);
        $name = $request->request->get('name',null);
        $value = $request->request->get('value',null);
        $type = $request->request->get('type',null);

        if(is_null($name) || mb_strlen($name) == 0){
            throw new InternalServerErrorException('Property name is empty');
        }

        try{
            $property = $currentNode->setProperty($name, $value, $type);
            $repository->save();
        }catch(UnsupportedRepositoryOperationException $e){
            throw new NotSupportedOperationException(sprintf('Property %s can not be set with type %s', $property, $type));
        }catch(ValueFormatException $e){
            throw new NotSupportedOperationException(sprintf('Property %s has an invalid value', $property));      
        }catch(LockException $e){
            throw new ResourceLockedException($sprintf('Property %s is currently locked', $property));
        }catch(ConstraintViolationException $e){
            throw new ResourceConstraintViolationException($e->getMessage());
        }catch(RepositoryException $e){
            throw new ResourceNotFoundException($e->getMessage());
        }catch(VersionException $e){
            throw new InternalServerErrorException($e->getMessage());
        }catch(\InvalidArgumentException $e){
            throw new InternalServerErrorException($e->getMessage());
        }
       
        return $app->json(sprintf('Property %s added', $name));
    }

}
