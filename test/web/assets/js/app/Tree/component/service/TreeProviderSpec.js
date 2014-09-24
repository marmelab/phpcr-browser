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
            $progress,
            $tree
        ;

        beforeEach(function() {
            $injector = new Injector();

            $rootScope = $injector.get('$rootScope');
            $graph = $injector.get('$graph');
            $state = $injector.get('$state');
            $treeFactory = $injector.get('$treeFactory');
            $progress = $injector.get('$progress');

            $state.params = {
                repository: 'test',
                workspace: 'default',
                path: '/jcr:nodeTypes/rep:Group'
            };

            $injector.provider('$tree', TreeProvider)
            $tree = $injector.get('$tree');
        });

        it('should instanciate Tree service and return a patched promise when $get is called', function() {
            expect($tree.then).toEqual(jasmine.any(Function));
            expect($tree.notified).toEqual(jasmine.any(Function));

            expect($tree.then).not.toHaveBeenCalled();

            var listener = jasmine.createSpy('listener');

            $tree.notified(listener);
            $tree.notify('test');
            $rootScope.$digest(); // resolve $q promise
            expect(listener).toHaveBeenCalledWith('test');

            $rootScope.$broadcast('$stateChangeSuccess',
                { name: 'node' },
                { repository: 'test', workspace: 'default', path: '/jcr:nodeTypes/rep:Group' },
                {},
                { repository: 'old', workspace: 'o' }
            );
            $rootScope.$digest(); // resolve $q promise
            expect(listener.callCount).toBe(2);
        });

        it('should call $graph.find on $$init and create a tree', function() {
            expect($graph.find).toHaveBeenCalledWith({
                repository: 'test',
                workspace: 'default',
                path: '/jcr:nodeTypes/rep:Group'
            }, {
                reducedTree: true
            });

            var fixture = angular.copy(nodeFixture.reducedTree['/']);
            fixture.name = 'root';

            expect($treeFactory).toHaveBeenCalledWith({
                children: [fixture]
            });

            expect($treeFactory.activate).toHaveBeenCalled();
            expect($progress.done).toHaveBeenCalled();
        });

        it('should register listener for $stateChangeSuccess event', function() {
            expect($rootScope.$on).toHaveBeenCalledWith('$stateChangeSuccess', jasmine.any(Function));
        });
    });
});
