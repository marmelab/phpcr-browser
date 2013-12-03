<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Converter;

use PHPCRBrowser\API\Exception\ResourceNotFoundException;
use PHPCRBrowser\API\Exception\AccessDeniedException;
use PHPCRBrowser\API\Exception\GatewayTimeoutException;
use PHPCRBrowser\API\Exception\InternalServerErrorException;
use PHPCRBrowser\PHPCR\Exception\RepositoryCollectionUnknownKeyException;
use PHPCRBrowser\PHPCR\RepositoryCollection;
use PHPCRBrowser\PHPCR\Session;
use PHPCR\LoginException;
use PHPCR\NoSuchWorkspaceException;
use PHPCR\RepositoryException;
use Symfony\Component\HttpFoundation\Request;

/**
 * Convert a repository name into a session
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 */
class RepositoryConverter
{
    private $repositories;

    public function __construct(RepositoryCollection $repositories)
    {
        $this->repositories = $repositories;
    }

    public function convert($repository, Request $request)
    {
        if (is_null($repository)) {
            return null;
        }
        $workspace = $request->attributes->has('workspace') ? $request->attributes->get('workspace') : null;
       
        try {
            $session = new Session(
                $this->repositories->get($repository),
                $workspace
            );

            if (!is_null($workspace)) {
                $path = $request->attributes->get('path');
                if (substr($path, 0, 1) != '/') {
                    $path = '/'.$path;
                }
            }

            return $session;
        } catch (RepositoryCollectionUnknownKeyException $e) {
            throw new ResourceNotFoundException('Unknown repository');
        } catch (NoSuchWorkspaceException $e) {
            if (!is_null($workspace)) {
                throw new ResourceNotFoundException('Unknown workspace');
            } else {
                throw new GatewayTimeoutException('Repository not available');
            }
        } catch (LoginException $e) {
            throw new AccessDeniedException('Invalid credentials');
        } catch (RepositoryException $e) {
            throw new InternalServerErrorException('Internal server error');
        }
    }
}
