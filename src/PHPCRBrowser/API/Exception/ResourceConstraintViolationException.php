<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Exception;

/**
 * The ResourceConstraintViolationException is thrown when a resource depends on unsatisfied constraints
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 * @api
 */

class ResourceConstraintViolationException extends \Exception implements ExceptionInterface
{
    public function __construct($message)
    {
        parent::__construct($message, 423);
    }
}
