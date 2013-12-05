<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\PHPCR;

use PHPCRBrowser\PHPCR\Repository;

/**
 * The RepositoryConfigurationLoader give access to all declared repositories in configuration.
 *
 * It wraps them into the custom Repository class to add metadata to it and get better control.
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 * @api
 */
class RepositoryConfigurationLoader
{
    /**
     * Configuration dependency
     *
     * @var array The configuration
     */
    private $configuration;

    /**
     * Service constructor
     *
     * @param array $repositories The repositories configuration
     * @param array $factories The factories configuration
     */
    public function __construct($repositories, $factories)
    {
        $this->configuration = array('repositories' => $repositories, 'factories' => $factories);
    }

    /**
     * Get all repositories based on configuration and store them into the RepositoryCollection
     */
    public function getRepositories()
    {
        $repos = array();
        try {
            $repositories = $this->configuration['repositories'];
            $factories = (array) $this->configuration['factories'];

            if (!is_array($repositories)) {
                throw new \InvalidArgumentException('An error occurred during repositories parsing : repositories is not an array');
            }

            foreach ($repositories as $name => $repository) {
                if (!is_array($repository)) {
                    throw new \InvalidArgumentException('An error occurred during repositories parsing : repository is not an array');
                }

                if (count(array_intersect(array_keys($repository), array('factory', 'parameters'))) != 2) {
                    throw new \InvalidArgumentException('An error occurred during repositories parsing : missing factory or parameters');
                }

                if (!is_null($repository['parameters']) && !is_array($repository['parameters'])) {
                    throw new \InvalidArgumentException('An error occurred during repositories parsing : parameters is not an array');
                }

                if (!array_key_exists($repository['factory'], $factories)) {
                    throw new \InvalidArgumentException('An error occurred during repositories parsing : factory does not exist');
                }

                if(count(array_intersect(
                    array_keys($repository['parameters']),
                    $factories[$repository['factory']]['parameters'])) != count($factories[$repository['factory']]['parameters'])){
                    throw new \InvalidArgumentException('An error occurred during repositories parsing : missing parameters');
                }

                $repos []= new Repository($name, $factories[$repository['factory']]['class'], $repository['factory'], (array) $repository['parameters'], (array) $factories[$repository['factory']]['support']);
            }

        } catch (\RuntimeException $e) {
            throw new \InvalidArgumentException('An error occurred during repositories parsing : factories or repositories does not exist');
        }

        return $repos;
    }
}
