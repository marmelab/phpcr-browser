<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\PHPCR;

/**
 * Session is a wrapper for a PHPCR Session
 * Helps us to add metadata to it and provides more control possibilities
 * Further it contains our custom Repositories
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 * @api
 */
class Session
{
    /**
     * PHPCR Session the session refers to
     *
     * @var \PHPCR\SessionInterface $session The PHPCR Session
     */
    private $session;

    /**
     * Repository the session refers to
     *
     * @var Repository $repository The repository
     */
    private $repository;

    /**
     * Session constructor
     *
     * @param Repository $repository The repository to log in
     * @param string $workspaceName The workspace's name
     *
     * @api
     */
    public function __construct(Repository $repository, $workspaceName = null)
    {
        $this->repository = $repository;
        $parameters = $repository->getParameters();

        $credentials = new \PHPCR\SimpleCredentials(
            $parameters['credentials.username'],
            $parameters['credentials.password']
        );
       
        $this->session = $repository->login($credentials, $workspaceName);
    }

    /**
    * @see \PHPCR\SessionInterface::getNode
    */
    public function getNode($absPath, $depthHint = -1)
    {
        $node = $this->session->getNode($absPath, $depthHint);

        return new Node($node);
    }

    /**
    * @see \PHPCR\SessionInterface::getNodeByIdentifier
    */
    public function getNodeByIdentifier($id)
    {
        $node = $this->session->getNodeByIdentifier($id);

        return new Node($node);
    }

    /**
    * @see \PHPCR\SessionInterface::getNodes
    */
    public function getNodes($absPaths = null)
    {
        $nodes = $this->session->getNodes($absPaths);
        foreach ($nodes as $name=>$node) {
            $nodes[$name] = new Node($node);
        }

        return $nodes;
    }

    /**
    * @see \PHPCR\SessionInterface::getNodesByIdentifiers
    */
    public function getNodesByIdentifiers($ids)
    {
        $nodes = $this->session->getNodesByIdentifiers($ids);
        foreach ($nodes as $name=>$node) {
            $nodes[$name] = new Node($node);
        }

        return $nodes;
    }

    /**
    * @see \PHPCR\SessionInterface::getRootNode
    */
    public function getRootNode()
    {
        return new Node($this->session->getRootNode());
    }

    /**
    * @see \PHPCR\SessionInterface::getRepository
    */
    public function getRepository()
    {
        return $this->repository;
    }

    /**
     * Call bridge with the Repository and wrapped PHPCR Session
     *
     * @param string $funcName Function's name
     * @param array  $args     Function's arguments
     */
    public function __call($funcName, $args)
    {
        if (method_exists($this->repository, $funcName)) {
            return call_user_func_array(array($this->repository, $funcName), $args);
        } else {
            return call_user_func_array(array($this->session, $funcName), $args);
        }
    }
}
