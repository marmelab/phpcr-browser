<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\PHPCR;

use PHPCRBrowser\PHPCR\Exception\RepositoryCollectionUnknownKeyException;

/**
 * RepositoryCollection provides collection management for Repository
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 * @api
 */
class RepositoryCollection implements \IteratorAggregate
{
    /**
     * All the repositories contain into the collection
     *
     * @var array $repositories The repositories
     */
    private $repositories = array();

    /**
     * RepositoryCollection constructor
     *
     * @param array $repositories An optional array of Repository to add to the collection
     *
     * @api
     */
    public function __construct(array $repositories = array())
    {
        foreach ($repositories as $repository) {
            $this->add($repository);
        }
    }

    /**
     * Add a Repository to the collection
     *
     * @param Repository $repostory The repository
     *
     * @return RepositoryCollection $this The used collection
     *
     * @api
     */
    public function add(Repository $repository)
    {
        $this->repositories[$repository->getName()] = $repository;
        return $this;
    }

    /**
     * Remove a repository from the collection
     *
     * @param string $name The name of the repository
     *
     * @return boolean Returns true in case of success
     *
     * @thrown DomainException if the repository does not exist in the collection
     *
     * @api
     */
    public function remove($name)
    {
        if (!array_key_exists($name, $this->repositories)) {
            throw new RepositoryCollectionUnknownKeyException(sprintf('Repository name=%s does not exist',$name));
        }
        
        unset($this->repositories[$name]);

        return true;
    }

    /**
     * Get a repository from the collection
     *
     * @param string $name The name of the repository
     *
     * @return Repository The found reopsitory
     *
     * @thrown DomainException if the repository does not exist in the collection
     *
     * @api
     */
    public function get($name)
    {
        if (!array_key_exists($name, $this->repositories)) {
            throw new RepositoryCollectionUnknownKeyException(sprintf('Repository name=%s does not exist',$name));
        }

        return $this->repositories[$name];
    }


    /**
     * Get all the repositories stored in the collection
     *
     * @return array The repositories
     *
     * @api
     */
    public function getAll()
    {
        return $this->repositories;
    }

    /**
     * Get all names of repositories
     *
     * @return array The names
     *
     * @api
     */
    public function keys()
    {
        return array_keys($this->getAll());
    }

    /**
     * @see \IteratorAggregate::getIterator
     */
    public function getIterator()
    {
        return new \ArrayIterator($this->repositories);
    }
}
