<?php

error_reporting(0);

use Igorw\Silex\ConfigServiceProvider;

require_once __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../src/app.php';

$app->register(new ConfigServiceProvider(__DIR__."/../config/prod.yml"));

$app->run();
