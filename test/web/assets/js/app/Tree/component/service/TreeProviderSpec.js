/*global describe,it,expect,beforeEach*/
define([
    'app/Tree/component/service/TreeProvider',
    'mock/Injector',
    'fixture/node',
    'angular',
    'angular-mocks'
], function(TreeProvider, Injector, nodeFixture, angular) {
    'use strict';

    describe('TreeProvider', function() {
        var injector = angular.injector(['ngMock']),
            $injector,
            $rootScope,
            $graph,
            $state,
            $treeFactory,
            $tree
        ;

        beforeEach(function() {
            $injector = new Injector();

            $rootScope = $injector.get('$rootScope');
            $graph = $injector.get('$graph');
            $state = $injector.get('$state');
            $treeFactory = $injector.get('$treeFactory');

            $state.params = {
                repository: 'test',
                workspace: 'default',
                path: '/toto'
            };

            $injector.provider('$tree', TreeProvider)
            $tree = $injector.get('$tree');
        });

        it('should instanciate Tree service and return a patched promise when $get is called', function() {
            expect($tree.then).toEqual(jasmine.any(Function));
            expect($tree.notified).toEqual(jasmine.any(Function));
        });

        it('should call $graph.find on $$init and create a tree', function() {
            expect($graph.find).toHaveBeenCalledWith({
                repository: 'test',
                workspace: 'default',
                path: '/toto'
            }, {
                reducedTree: true
            });
            var fixture = angular.copy(nodeFixture.reducedTree['/']);
            fixture.name = 'root';

            expect($treeFactory).toHaveBeenCalledWith({
                children: [fixture]
            });
        });

        it('should register listener for $stateChangeSuccess event', function() {
            expect($rootScope.$on).toHaveBeenCalledWith('$stateChangeSuccess', jasmine.any(Function));
        });
    });
});
