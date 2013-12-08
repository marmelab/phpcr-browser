<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Exception;

/**
 * The NotSupportedOperationException is thrown when a not supported operation try to execute
 *
 * @author  Robin Bressan <robin@marmelab.comn>
 *
 * @api
 */

class NotSupportedOperationException extends \Exception implements ExceptionInterface
{
    public function __construct($message)
    {
        parent::__construct($message, 424);
    }
}
