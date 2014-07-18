define([
    'text!../view/layout.html',
    'text!../view/navbar.html'
], function (layoutTemplate, navbarTemplate) {
    "use strict";

    function routing($stateProvider, $locationProvider) {

        $stateProvider
            .state('main', {
                'abstract': true,
                'views': {
                    '': {
                        'controller': 'AppController',
                        'controllerAs': 'appController',
                        'template': layoutTemplate
                    },
                    'navbar@main': {
                        'abstract': true,
                        'controller': 'NavbarController',
                        'controllerAs': 'navbarController',
                        'template': navbarTemplate
                    }
                }
            });
    }

    routing.$inject = ['$stateProvider', '$locationProvider'];

    return routing;

});
