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
            if(mb_substr($path,0,1) != '/'){
                return '/'.$path;
            }else{
                return $path;
            }
        };

        // Get all repositories
        $controllers->get('/repositories', array($this, 'getRepositoriesAction'))
            ->bind('browser.api.repositories');

        // Get a repository
        $controllers->get('/repositories/{repository}', array($this, 'getRepositoryAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->bind('browser.api.repository');

        // Get all workspace in a repository
        $controllers->get('/repositories/{repository}/workspaces', array($this, 'getWorkspacesAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->bind('browser.api.workspaces');

        // Get a workspace
        $controllers->get('/repositories/{repository}/workspaces/{workspace}', array($this, 'getWorkspaceAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->bind('browser.api.workspace');

        // Get a node in a workspace
        $controllers->get('/repositories/{repository}/workspaces/{workspace}/nodes{path}', array($this, 'getNodeAction'))
            ->assert('path', '.*')
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->convert('path', $pathConverter)
            ->bind('browser.api.node');

        // Add a workspace in a repository
        $controllers->post('/repositories/{repository}/workspaces', array($this, 'createWorkspaceAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');

        // Delete a workspace from a repository
        $controllers->delete('/repositories/{repository}/workspaces/{workspace}', array($this, 'deleteWorkspaceAction'))
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert');

         // Add a property in a node
        $controllers->post('/repositories/{repository}/workspaces/{workspace}/nodes{path}', array($this, 'addNodePropertyAction'))
            ->assert('path', '.*')
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->convert('path', $pathConverter);

        // Delete a property from a node
        $controllers->delete('/repositories/{repository}/workspaces/{workspace}/nodes{path}@{property}', array($this, 'deleteNodePropertyAction'))
            ->assert('path', '.*')
            ->convert('repository', 'phpcr_browser.browser_api.repository_converter:convert')
            ->convert('path', $pathConverter);

        return $controllers;
    }

    public function getRepositoriesAction(Application $app)
    {
        $repositories = $app['phpcr_browser.phpcr.repositories']->getAll();
        $data = array(
            'repositories'  =>  array(),
            'link'      =>  array(
                'self'  =>  $app->path('browser.api.repositories')
            )
        );

        foreach ($repositories as $repository) {
            $data['repositories'][] = array(
                'name'          =>  $repository->getName(),
                'factoryAlias'  =>  $repository->getFactoryAlias()
            );
        }

        return $app->json($data);
    }

    public function getRepositoryAction(Session $repository, Application $app)
    {
        $data = array(
            'repository'    =>  array(
                'name'          =>  $repository->getName(),
                'factoryAlias'  =>  $repository->getFactoryAlias()
            ),
            'link'          =>  array(
                'self'      =>  $app->path('browser.api.repositories'),
                'workspaces'=>  $app->path('browser.api.workspaces',array(
                    'repository'    =>  $repository->getName()
                ))
            )
        );
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
            'support'    => $workspaceSupport,
            'link'      =>  array(
                'self'  =>  $app->path('browser.api.workspaces',array(
                    'repository'    =>  $repository->getName()
                ))
            )
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

    public function getWorkspaceAction(Session $repository, $workspace, Application $app)
    {
        $repositorySupport = $repository->getSupport();
        $workspaceSupport = array();

        foreach($repositorySupport as $support){
            if(substr($support, 0, strlen('workspace.')) == 'workspace.'){
                $workspaceSupport[] = $support;
            }
        }

        $data = array(
            'workspace' => array(
                'name'  =>  $workspace
            ),
            'support'    => $workspaceSupport,
            'link'      =>  array(
                'self'  =>  $app->path('browser.api.workspaces',array(
                    'repository'    =>  $repository->getName()
                )),
                'nodes' =>  $app->path('browser.api.rootNode',array(
                    'repository'    =>  $repository->getName(),
                    'workspace'     =>  $workspace
                ))
            )
        );

        return $app->json($data);
    }

    public function getNodeAction(Session $repository, $workspace, $path, Application $app, Request $request)
    {
        if (!$repository->nodeExists($path)) {
            throw new ResourceNotFoundException('Unknown node');
        }

        $repositorySupport = $repository->getSupport();
        $nodeSupport = array();

        foreach($repositorySupport as $support){
            if(substr($support, 0, strlen('node.')) == 'node.'){
                $nodeSupport[] = $support;
            }
        }

        $data = array(
            'support'   =>  $nodeSupport,
            'node'      =>  array(),
            'link'      =>  array(
                'self'  =>  $app->path('browser.api.node',array(
                    'repository'    =>  $repository->getName(),
                    'workspace'     =>  $workspace,
                    'path'          =>  $path
                ))
            )
        );

        $currentNode = $repository->getNode($path);

        if($request->query->has('reducedTree')){
            $data['node']['reducedTree'] = Node::getReducedTree($currentNode);
        }

        $data['node']['name'] = $currentNode->getName();
        $data['node']['path'] = $currentNode->getPath();
        $data['node']['repository'] = $repository->getName();
        $data['node']['workspace'] = $workspace;
        $data['node']['children'] = array();
        foreach ($currentNode->getNodes() as $node) {
            $data['node']['children'][] = array(
                'name'          =>  $node->getName(),
                'path'          =>  $node->getPath(),
                'children'      =>  array(),
                'hasChildren'   =>  (count($node->getNodes()) > 0)
            );
        }

        $data['node']['hasChildren'] = (count($data['node']['children']) > 0);

        if ($currentNode->getPath() != $repository->getRootNode()->getPath()) {
            $data['node']['parent'] = $currentNode->getParent()->getName();
        }
        $data['node']['nodeProperties'] = $currentNode->getPropertiesToArray();

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

    public function deleteWorkspaceAction(Session $repository, $workspace, Application $app, Request $request)
    {
        $currentWorkspace = $repository->getWorkspace();

        if(is_null($workspace) || mb_strlen($workspace) == 0){
            throw new InternalServerErrorException('Workspace name is empty');
        }

        try{
            $currentWorkspace->deleteWorkspace($workspace);
        }catch(\PHPCR\AccessDeniedException $e){
            throw new AccessDeniedException('Invalid credentials');
        }catch(UnsupportedRepositoryOperationException $e){
            throw new NotSupportedOperationException('Repository does not support workspace deletion. Maybe you should delete its folder.');
        }catch(NoSuchWorkspaceException $e){
            throw new ResourceNotFoundException(sprintf('Workspace %s does not exist', $workspace));
        }catch(RepositoryException $e){
            throw new ResourceNotFoundException($e->getMessage());
        }
       
        return $app->json(sprintf('Workspace %s deleted', $workspace));
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
