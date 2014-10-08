define(
    [
        'angular',
        'ng-tree',

        'app/Tree/component/controller/NodeCreationFormController',

        'app/Tree/component/service/FindPatcher',
        'app/Tree/component/service/TreeProvider',

        'app/Tree/component/directive/NodeCreationForm',

        'app/Tree/config/decorateTreeFactory',

        'app/Tree/run/loadTreeFactory'
    ],
    function (
        angular,
        ngTree,

        NodeCreationFormController,

        FindPatcher,
        TreeProvider,

        NodeCreationForm,

        decorateTreeFactory,

        loadTreeFactory
    ) {
        'use strict';

        var TreeModule = angular.module('tree', ['ngTree']);

        TreeModule.controller('NodeCreationFormController', NodeCreationFormController);

        TreeModule.service('$findPatcher', FindPatcher);
        TreeModule.provider('$tree', TreeProvider);

        TreeModule.directive('nodeCreationForm', NodeCreationForm);

        TreeModule.config(decorateTreeFactory);

        TreeModule.run(loadTreeFactory);

        return TreeModule;
    }
);
