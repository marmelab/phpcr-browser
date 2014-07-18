define(
    [
        'angular',
        'nprogress',

        'app/Main/component/controller/AppController',
        'app/Main/component/controller/NavbarController',

        'app/Main/component/service/Search',

        'app/Main/config/routing',
        'app/Main/config/loadLocales',

        'app/Main/run/loadLogListeners',
        'app/Main/run/loadStateErrorListener',
        'app/Main/run/loadProgress',

        'text!app/config.json',

        'angular-ui-router', 'angular-translate', 'angular-translate-storage-cookie', 'angular-bootstrap-tpls', 'talker', 'angular-js-toaster'
    ],
    function (
        angular,
        NProgress,

        AppController,
        NavbarController,

        Search,

        routing,
        loadLocales,

        loadLogListeners,
        loadStateErrorListener,
        loadProgress,

        config
    ) {
        'use strict';

        var MainModule = angular.module('main', [
            'ui.router',
            'pascalprecht.translate',
            'ui.bootstrap',
            'talker',
            'toaster',
        ]);

        MainModule.controller('AppController', AppController);
        MainModule.controller('NavbarController', NavbarController);

        MainModule.factory('$progress', function() { return NProgress; });

        MainModule.service('$search', Search);

        MainModule.config(routing);
        MainModule.config(loadLocales);

        MainModule.run(loadLogListeners);
        MainModule.run(loadStateErrorListener);
        MainModule.run(loadProgress);

        return MainModule;
    }
);
