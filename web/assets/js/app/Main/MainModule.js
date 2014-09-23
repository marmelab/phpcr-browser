define(
    [
        'angular',
        'nprogress',

        'app/Main/component/controller/AppController',
        'app/Main/component/controller/NavbarController',

        'app/Main/component/service/Notification',
        'app/Main/component/service/Search',

        'app/Main/config/routing',
        'app/Main/config/loadLocales',

        'app/Main/run/loadStateErrorListener',
        'app/Main/run/loadProgress',
        'app/Main/run/loadIntervalCheck',

        'text!app/config.json',

        'angular-ui-router', 'angular-translate', 'angular-translate-storage-cookie', 'angular-bootstrap-tpls'
    ],
    function (
        angular,
        NProgress,

        AppController,
        NavbarController,

        Notification,
        Search,

        routing,
        loadLocales,

        loadStateErrorListener,
        loadProgress,
        loadIntervalCheck,

        config
    ) {
        'use strict';

        var MainModule = angular.module('main', [
            'ui.router',
            'pascalprecht.translate',
            'ui.bootstrap'
        ]);

        MainModule.controller('AppController', AppController);
        MainModule.controller('NavbarController', NavbarController);

        MainModule.factory('$progress', function() { return NProgress; });

        MainModule.service('$notification', Notification);
        MainModule.service('$search', Search);

        MainModule.config(routing);
        MainModule.config(loadLocales);

        MainModule.run(loadStateErrorListener);
        MainModule.run(loadProgress);
        MainModule.run(loadIntervalCheck);

        return MainModule;
    }
);
