/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/controller/NodeController',
    'mock/Graph',
    'mock/Search',
    'mock/TreeFactory',
    'mock/NotificationFactory',
    'mixin',
    'angular',
    'angular-mocks'
], function(NodeController, Graph, Search, TreeFactory, NotificationFactory, mixin, angular) {
    'use strict';

    describe('NodeController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $state,
            $graph,
            $search,
            $fuzzyFilter,
            $treeFactory,
            $notify,
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

            $treeFactory = TreeFactory;

            $notify = jasmine.createSpy('$notify').andReturn(NotificationFactory());

            nodeController = new NodeController(
                $scope,
                $state,
                $graph,
                $search,
                $fuzzyFilter,
                $treeFactory,
                null,
                null,
                $notify
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
            }, { cache: undefined });
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
                { name: 'a', value: 'b', type: 1 }
            ]);

            expect($search.registerListener).toHaveBeenCalledWith(searchListener);
        });

        it('should call node.renameNode when renameNode is called', function() {
            spyOn(nodeController, 'hideNodeRenameForm');
            spyOn(nodeController.$treeFactory, 'walkChildren');

            nodeController.$scope.node.rename = jasmine.createSpy('rename').andReturn(mixin.buildPromise());
            nodeController.$scope.node.path = '/test';

            var tree = {
                attr: jasmine.createSpy('attr').andReturn('/hi'),
                path: jasmine.createSpy('path').andReturn('/test')
            };

            nodeController.$scope.tree = {
                find: jasmine.createSpy('find').andReturn(mixin.buildPromise(tree))
            };

            nodeController.$scope.nodeRenameForm.name = null;

            nodeController.renameNode();

            expect(nodeController.$notify).toHaveBeenCalled();

            nodeController.$notify.reset();

            nodeController.$scope.nodeRenameForm.name = nodeController.$scope.node.name;
            nodeController.renameNode();

            expect(nodeController.$notify).not.toHaveBeenCalled();
            expect(nodeController.hideNodeRenameForm).toHaveBeenCalled();

            nodeController.hideNodeRenameForm.reset();

            nodeController.$scope.nodeRenameForm.name = 'hi';

            nodeController.renameNode();

            expect(nodeController.$scope.node.rename).toHaveBeenCalledWith('hi');
            expect(nodeController.$scope.tree.find).toHaveBeenCalledWith('/root/test');
            expect(tree.attr).toHaveBeenCalledWith('name', 'hi');
            expect(nodeController.$treeFactory.walkChildren).toHaveBeenCalledWith(tree, jasmine.any(Function));
            expect(nodeController.hideNodeRenameForm).toHaveBeenCalled();
            expect(nodeController.$state.go).toHaveBeenCalledWith('node', {
                repository: 'test',
                workspace: 'default',
                path: '/hi'
            })
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

        it('should hide rename form when hideNodeRenameForm is called', function() {
            nodeController.$scope.nodeRenameFormDisplayed = true;
            nodeController.$scope.nodeRenameForm.name = 'Hey';

            nodeController.hideNodeRenameForm();

            expect(nodeController.$scope.nodeRenameFormDisplayed).toBe(false);
            expect(nodeController.$scope.nodeRenameForm.name).toBe('test');
        });

        it('should show rename form when showNodeRenameForm is called', function() {
            nodeController.$scope.node.path = '/';
            nodeController.$scope.nodeRenameFormDisplayed = false;

            nodeController.showNodeRenameForm();

            expect(nodeController.$scope.nodeRenameFormDisplayed).toBe(false);

            nodeController.$scope.node.path = '/test';

            nodeController.showNodeRenameForm();

            expect(nodeController.$scope.nodeRenameFormDisplayed).toBe(true);
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
            expect(nodeController.$notify).toBeUndefined();
            expect(nodeController.search).toBeUndefined();
            expect(nodeController.propertyTypes).toBeUndefined();
        });
    });
});
