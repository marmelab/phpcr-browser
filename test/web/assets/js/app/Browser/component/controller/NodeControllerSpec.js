/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/controller/NodeController',
    'mock/Graph',
    'mock/Search',
    'mixin',
    'angular',
    'angular-mocks'
], function(NodeController, Graph, Search, mixin, angular) {
    'use strict';

    describe('NodeController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $state,
            $graph,
            $search,
            $fuzzyFilter,
            nodeController,
            searchListener,
            removeSearchListener
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            $state = {
                params: {
                    repository: 'test',
                    workspace: 'default',
                    path: '/test'
                },
                go: jasmine.createSpy('go')
            };

            $graph = new Graph();
            spyOn($graph, 'find').andReturn(mixin.buildPromise({
                name: 'test',
                properties: {
                    a: { value: 'b', type: 1 },
                    c: { value: 'd', type: 1 }
                }
            }));

            $search = new Search();
            removeSearchListener = jasmine.createSpy('removeSearchListener');
            spyOn($search, 'registerListener').andCallFake(function(listener) {
                searchListener = listener;
                return removeSearchListener;
            });

            $fuzzyFilter = jasmine.createSpy('$fuzzyFilter').andReturn(['a']);

            nodeController = new NodeController(
                $scope,
                $state,
                $graph,
                $search,
                $fuzzyFilter
            );
        });

        it('shoud init propertyTypes', function() {
            expect(nodeController.propertyTypes).toEqual([
                'undefined',
                'String',
                'Binary',
                'Long',
                'Double',
                'Date',
                'Boolean',
                'Name',
                'Path',
                'Reference',
                'WeakReference',
                'URI',
                'Decimal',
            ]);
        });

        it('should call $graph.find to set $scope.node and build $scope.properties', function() {
            expect(nodeController.$graph.find).toHaveBeenCalledWith({
                repository: 'test',
                workspace: 'default',
                path: '/test'
            });
            // As we use our mock, the promises are always resolved synchronously
            expect(nodeController.$scope.node).toEqual({
                name: 'test',
                properties: {
                    a: { value: 'b', type: 1 },
                    c: { value: 'd', type: 1 }
                }
            });

            expect(nodeController.$fuzzyFilter).toHaveBeenCalledWith(['a', 'c'], null);
            expect(nodeController.$scope.properties).toEqual([
                { name: 'a', value: 'b', type: 'String' }
            ]);

            expect($search.registerListener).toHaveBeenCalledWith(searchListener);
        });

        it('should call $$filterProperties when searchListener is called', function() {
            spyOn(nodeController, '$$filterProperties').andCallThrough();

            searchListener('searching...');
            expect(nodeController.search).toBe('searching...');
            expect(nodeController.$$filterProperties).toHaveBeenCalled();
            expect(nodeController.$fuzzyFilter).toHaveBeenCalledWith(['a', 'c'], 'searching...');

            // Same string, it should not call $$filterRepositories
            searchListener('searching...');
            expect(nodeController.$$filterProperties.callCount).toBe(1); // the init call is not spied yet
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            spyOn(nodeController, '$$destroy').andCallThrough();

            expect(nodeController.$$destroy).not.toHaveBeenCalled();
            nodeController.$scope.$destroy();

            expect(removeSearchListener).toHaveBeenCalled();
            expect(nodeController.$$destroy).toHaveBeenCalled();
            expect(nodeController.$scope).toBeUndefined();
            expect(nodeController.$state).toBeUndefined();
            expect(nodeController.$graph).toBeUndefined();
            expect(nodeController.$search).toBeUndefined();
            expect(nodeController.$fuzzyFilter).toBeUndefined();
            expect(nodeController.search).toBeUndefined();
            expect(nodeController.propertyTypes).toBeUndefined();
        });
    });
});
