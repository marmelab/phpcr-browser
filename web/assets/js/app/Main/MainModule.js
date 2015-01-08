define(
    [
        'angular',
        'nprogress',

        'app/Main/component/controller/AppController',
        'app/Main/component/controller/NavbarController',

        'app/Main/component/service/Search',
        'app/Main/component/service/ErrorFromResponse',

        'app/Main/config/routing',
        'app/Main/config/loadHttpInterceptor',
        'app/Main/config/loadLocales',

        'app/Main/run/loadStateErrorListener',
        'app/Main/run/loadProgress',
        'app/Main/run/loadOfflineStatusUpdate',

        'app/Main/util/notificationPatcher',

        'ui-router', 'angular-translate', 'angular-translate-storage-cookie', 'ui-bootstrap-tpls', 'angular-cookies',
        'ng-n'
    ],
    function (
        angular,
        NProgress,

        AppController,
        NavbarController,

        Search,
        ErrorFromResponse,

        routing,
        loadHttpInterceptor,
        loadLocales,

        loadStateErrorListener,
        loadProgress,
        loadOfflineStatusUpdate,

        notificationPatcher
    ) {
        'use strict';

        var MainModule = angular.module('main', [
            'ui.router',
            'pascalprecht.translate',
            'ui.bootstrap',
            'ngCookies',
            'ngN'
        ]);

        MainModule.controller('AppController', AppController);
        MainModule.controller('NavbarController', NavbarController);

        MainModule.factory('$progress', function() { return NProgress; });

        MainModule.factory('$error', ['$translate', '$n', function($translate, $n) {
            return notificationPatcher($n.extend({ 'type': 'danger', content: '' }), $translate);
        }]);

        MainModule.factory('$info', ['$translate', '$n', function($translate, $n) {
            return notificationPatcher($n.extend({ 'type': 'info', content: '' }), $translate);
        }]);

        MainModule.factory('$success', ['$translate', '$n', function($translate, $n) {
            return notificationPatcher($n.extend({ 'type': 'success', content: '' }), $translate);
        }]);

        MainModule.factory('$warning', ['$translate', '$n', function($translate, $n) {
            return notificationPatcher($n.extend({ 'type': 'warning', content: '' }), $translate);
        }]);

        MainModule.factory('$error', ['$translate', '$n', function($translate, $n) {
            return notificationPatcher($n.extend({ 'type': 'danger', content: '' }), $translate);
        }]);

        MainModule.factory('$errorFromResponse', ErrorFromResponse);

        MainModule.service('$search', Search);

        MainModule.config(routing);
        MainModule.config(loadHttpInterceptor);
        MainModule.config(loadLocales);

        MainModule.run(loadStateErrorListener);
        MainModule.run(loadProgress);
        MainModule.run(loadOfflineStatusUpdate);

        return MainModule;
    }
);
