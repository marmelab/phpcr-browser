<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\PHPCR;

/**
 * Repository is a wrapper for a PHPCR Repository
 * Helps us to add metadata to it and provides more control possibilities
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 * @api
 */
class Repository
{
    /**
     * PHPCR Repository the repository refers to
     *
     * @var \PHPCR\RepositoryInterface $repository The PHPCR Repository
     */
    private $repository;

    /**
     * Factory class used to instantiate the PHPCR Repository
     *
     * @var string $factoryClass The factory class
     */
    private $factoryClass;

    /**
     * Factory alias used for display purposes
     *
     * @var string $factoryAlias The factory alias
     */
    private $factoryAlias;

    /**
     * Repository constructor
     *
     * @param string $name         Repository's name
     * @param string $factoryClass The factory class needed to instantiate our PHPCR repository
     * @param string $factoryAlias The factory alias needed for display purposes
     * @param array  $parameters   Parameters of the repository
     *
     * @api
     */
    public function __construct($name, $factoryClass, $factoryAlias, array $parameters = array())
    {
        $this->name = $name;
        $this->factoryClass = $factoryClass;
        $this->factoryAlias = $factoryAlias;
        $this->parameters = $parameters;

        $this->repository = function () use ($factoryClass, $parameters) {
            $factory = new $factoryClass();

            return $factory->getRepository($parameters);
        };
    }

    /**
     * Return the factory class
     *
     * @return string Factory class of the repository
     *
     * @api
     */
    public function getFactoryClass()
    {
        return $this->factoryClass;
    }

    /**
     * Return the factory alias
     *
     * @return string Factory alias of the repository
     *
     * @api
     */
    public function getFactoryAlias()
    {
        return $this->factoryAlias;
    }

    /**
     * Return the parameters
     *
     * @return string Parameters of the repository
     *
     * @api
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    /**
     * Return name
     *
     * @return string Name of the repository
     *
     * @api
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Return the wrapped PHPCR Repository
     *
     * @return \PHPCR\RepositoryInterface The wrapped repository
     */
    private function getRepository()
    {
        $c = $this->repository;
        if ($c instanceof \Closure) {
            $this->repository = $c();
        }

        return $this->repository;
    }
    
    /**
     * Call bridge with the wrapped PHPCR Repository
     *
     * @param string $funcName Function's name
     * @param array  $args     Function's arguments
     */
    public function __call($funcName, $args)
    {
        return call_user_func_array(array($this->getRepository(), $funcName), $args);
    }
}
