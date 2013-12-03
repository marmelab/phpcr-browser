<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\Browser\Exception;

/**
 * The APINotAvailableException is thrown when the api is offline
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 * @api
 */

class APINotAvailableException extends \Exception
{
    public function __construct($message)
    {
        parent::__construct($message, 500);
    }
}
