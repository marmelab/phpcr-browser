<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Exception;

/**
 * The ResourceNotFoundException is thrown when a resource is not available through the API
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 * @api
 */

class ResourceNotFoundException extends \Exception implements ExceptionInterface
{
    public function __construct($message)
    {
        parent::__construct($message, 404);
    }
}
