<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\API\Exception;

/**
 * The InternalServerErrorException is thrown when an unknown error occured
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 * @api
 */

class InternalServerErrorException extends \Exception implements ExceptionInterface
{
    public function __construct($message)
    {
        parent::__construct($message, 500);
    }
}
