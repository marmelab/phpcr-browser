define(
    [
        'angular',

        'app/Browser/component/controller/RepositoriesController',
        'app/Browser/component/controller/RepositoryController',
        'app/Browser/component/controller/WorkspaceController',
        'app/Browser/component/controller/NodeController',

        'app/Browser/component/directive/Trash',

        'app/Browser/component/filter/Fuzzy',
        'app/Browser/component/filter/PropertiesSorter',

        'app/Browser/config/routing',

        'angular-ui-router', 'angular-ui-util-keypress'
    ],
    function (
        angular,

        RepositoriesController,
        RepositoryController,
        WorkspaceController,
        NodeController,

        Trash,

        Fuzzy,
        PropertiesSorter,

        routing
    ) {
        'use strict';

        var BrowserModule = angular.module('browser', [
            'ui.router',
            'ui.keypress'
        ]);

        BrowserModule.controller('RepositoriesController', RepositoriesController);
        BrowserModule.controller('RepositoryController', RepositoryController);
        BrowserModule.controller('WorkspaceController', WorkspaceController);
        BrowserModule.controller('NodeController', NodeController);

        BrowserModule.directive('trash', Trash);

        BrowserModule.filter('$fuzzy', Fuzzy);
        BrowserModule.filter('PropertiesSorter', PropertiesSorter);

        BrowserModule.config(routing);

        return BrowserModule;
    }
);
