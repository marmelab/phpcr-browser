/*global describe,it,expect,beforeEach*/
define([
    'app/Tree/component/service/TreeProvider',
    'mock/TreeFactory',
    'mock/Graph',
    'mock/Progress',
    'fixture/node',
    'mixin',
    'angular',
    'angular-mocks'
], function(TreeProvider, TreeFactory, Graph, Progress, nodeFixture, mixin, angular) {
    'use strict';

    describe('TreeProvider', function() {
        var $injector = angular.injector(['ngMock']),
            treeProvider,
            $q,
            $rootScope,
            $state,
            $treeFactory,
            $graph,
            $progress,
            $tree,
            $cacheFactory
        ;

        beforeEach(function() {
            treeProvider = new TreeProvider();

            $q = $injector.get('$q');

            $rootScope = $injector.get('$rootScope');
            spyOn($rootScope, '$on').andCallThrough();

            $state = {
                params: {
                    repository: 'test',
                    workspace: 'default',
                    path: '/jcr:nodeTypes/rep:Group'
                },
                current: {
                    name: 'node'
                }
            };

            $treeFactory = jasmine.createSpy('$treeFactory').andCallFake(TreeFactory);
            angular.extend($treeFactory, TreeFactory);
            spyOn($treeFactory, 'activate').andCallThrough();

            $graph = new Graph();
            spyOn($graph, 'find').andReturn(mixin.buildPromise(angular.copy(nodeFixture)))

            $progress = new Progress();
            spyOn($progress, 'done').andCallThrough();

            $cacheFactory = $injector.get('$cacheFactory');

            $tree = treeProvider.$get[1]({
                instantiate: function(object, dependencies) {
                    var instance = new object(
                        dependencies.provider,
                        $q,
                        $rootScope,
                        $state,
                        $treeFactory,
                        $graph,
                        $progress,
                        $cacheFactory
                    );

                    instance.deferred.promise.notify = instance.deferred.notify;

                    return instance;
                }
            });
        });

        it('should instanciate Tree service and return a patched promise when $get is called', function() {
            spyOn($tree, 'then').andCallThrough();
            var cache = {
                removeAll: jasmine.createSpy('removeAll')
            };
            spyOn($cacheFactory, 'get').andReturn(cache);
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
            expect($cacheFactory.get).toHaveBeenCalledWith('$http');
            expect(cache.removeAll).toHaveBeenCalled();
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
