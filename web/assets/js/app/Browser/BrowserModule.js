define(
    [
        'angular',

        'app/Browser/component/controller/RepositoriesController',
        'app/Browser/component/controller/RepositoryController',
        'app/Browser/component/controller/WorkspaceController',
        'app/Browser/component/controller/NodeController',

        'app/Browser/component/directive/Editable',
        'app/Browser/component/directive/Draggable',
        'app/Browser/component/directive/Droppable',
        'app/Browser/component/directive/Focus',
        'app/Browser/component/directive/PropertyValue',
        'app/Browser/component/directive/Trash',

        'app/Browser/component/filter/Fuzzy',
        'app/Browser/component/filter/PropertiesSorter',
        'app/Browser/component/filter/Unsafe',

        'app/Browser/config/routing',

        'ui-router', 'ui-util-keypress'
    ],
    function (
        angular,

        RepositoriesController,
        RepositoryController,
        WorkspaceController,
        NodeController,

        Editable,
        Draggable,
        Droppable,
        Focus,
        PropertyValue,
        Trash,

        Fuzzy,
        PropertiesSorter,
        Unsafe,

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

        BrowserModule.directive('editable', Editable);
        BrowserModule.directive('draggable', Draggable);
        BrowserModule.directive('droppable', Droppable);
        BrowserModule.directive('focus', Focus);
        BrowserModule.directive('propertyValue', PropertyValue);
        BrowserModule.directive('trash', Trash);

        BrowserModule.filter('$fuzzy', Fuzzy);
        BrowserModule.filter('$propertiesSorter', PropertiesSorter);
        BrowserModule.filter('unsafe', Unsafe);

        BrowserModule.config(routing);

        return BrowserModule;
    }
);
