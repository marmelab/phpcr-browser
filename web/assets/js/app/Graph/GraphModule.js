define(
    [
        'angular',

        'app/Graph/component/service/Graph',

        'app/Graph/config/configureRestangular',

         'restangular'
    ],
    function (
        angular,

        Graph,

        configureRestangular
    ) {
        'use strict';

        var GraphModule = angular.module('graph', ['restangular']);

        GraphModule.service('$graph', Graph);

        GraphModule.config(configureRestangular);

        return GraphModule;
    }
);
