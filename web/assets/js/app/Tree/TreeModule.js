define(
    [
        'angular',
        'ng-tree',

        'app/Tree/component/service/TreeProvider',

        'app/Tree/config/decorateTreeFactory',

        'app/Tree/run/loadTreeFactory'
    ],
    function (
        angular,
        ngTree,

        TreeProvider,

        decorateTreeFactory,

        loadTreeFactory
    ) {
        'use strict';

        var TreeModule = angular.module('tree', ['ngTree']);

        TreeModule.provider('$tree', TreeProvider);

        TreeModule.config(decorateTreeFactory);

        TreeModule.run(loadTreeFactory);

        return TreeModule;
    }
);
