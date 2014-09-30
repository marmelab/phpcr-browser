/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/controller/WorkspaceController',
    'mock/Graph',
    'mock/TreeFactory',
    'mock/Progress',
    'mixin',
    'angular',
    'angular-mocks'
], function(WorkspaceController, Graph, TreeFactory, Progress, mixin, angular) {
    'use strict';

    describe('WorkspaceController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $tree,
            $q,
            $state,
            $graph,
            $treeFactory,
            $progress,
            workspaceController,
            removeTreeListener
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            removeTreeListener = jasmine.createSpy('removeTreeListener');
            $tree = {
                notified: jasmine.createSpy('notified').andCallFake(function(listener) {
                    listener('myTree');

                    return removeTreeListener;
                })
            }

            $q = $injector.get('$q');

            $state = {
                params: {
                    repository: 'test',
                    workspace: 'default'
                },
                go: jasmine.createSpy('go').andReturn(mixin.buildPromise())
            };

            $graph = new Graph();
            spyOn($graph, 'find').andReturn(mixin.buildPromise([
                { name: 'test'}
            ]));

            $treeFactory = jasmine.createSpy('$treeFactory').andCallFake(TreeFactory);
            angular.extend($treeFactory, TreeFactory);

            $progress = new Progress();

            workspaceController = new WorkspaceController(
                $scope,
                $tree,
                $q,
                $state,
                $graph,
                $treeFactory,
                $progress
            );
        });

        it('should add a listener to $tree', function() {
            expect(workspaceController.$tree.notified).toHaveBeenCalledWith(jasmine.any(Function));
            expect(workspaceController.$scope.tree).toEqual('myTree');
        });

        it('should load children of a node when treeClick is called and the node\'s children are not loaded yet', function() {
            var deferred = {
                promise: {},
                resolve: jasmine.createSpy('resolve'),
                reject: jasmine.createSpy('reject')
            };

            spyOn(workspaceController.$treeFactory, 'patchChildren');
            spyOn(workspaceController.$q, 'defer').andReturn(deferred);
            spyOn(workspaceController.$progress, 'start').andCallThrough();

            workspaceController.$graph.find.andReturn(mixin.buildPromise({ children: [ { name: 'titi'} ] }));

            var selectedNode = {
                path: jasmine.createSpy('path').andReturn('/root/test'),
                attr: jasmine.createSpy('attr').andReturn(true),
                data: jasmine.createSpy('data').andReturn({
                    hasChildren: true
                }),
                children: jasmine.createSpy('children').andReturn([])
            };

            workspaceController.treeClick(selectedNode);

            expect(selectedNode.path).toHaveBeenCalled();
            expect(selectedNode.attr.calls[0].args).toEqual(['hasChildren']);
            expect(selectedNode.attr.calls[1].args).toEqual(['pending', true]);
            expect(workspaceController.$progress.start).toHaveBeenCalled();
            expect(workspaceController.$graph.find).toHaveBeenCalledWith({
                repository: 'test',
                workspace: 'default',
                path: '/test'
            }, { cache : true });
            expect(workspaceController.$treeFactory.patchChildren).toHaveBeenCalledWith(selectedNode, [ { name: 'titi'} ]);
            expect(workspaceController.$state.go).toHaveBeenCalledWith('node', {
                repository: 'test',
                workspace: 'default',
                path: '/test'
            });
            expect(selectedNode.attr.calls[2].args).toEqual(['pending', false]);
            expect(deferred.resolve).toHaveBeenCalled();
        });

        it('should call $$patchChildren and then $state.go when treeClick is called', function() {
            var deferred = {
                promise: {},
                resolve: jasmine.createSpy('resolve'),
                reject: jasmine.createSpy('reject')
            };

            spyOn(workspaceController.$q, 'defer').andReturn(deferred);
            spyOn(workspaceController.$progress, 'start').andCallThrough();
            spyOn(workspaceController.$progress, 'done').andCallThrough();
            spyOn(workspaceController, '$$patchChildren').andCallThrough();

            var selectedNode = {
                path: jasmine.createSpy('path').andReturn('/root/test'),
                attr: jasmine.createSpy('attr').andReturn(true),
                data: jasmine.createSpy('data').andReturn({
                    hasChildren: true
                }),
                children: jasmine.createSpy('children').andReturn([ { name: 'titi' }])
            };

            workspaceController.treeClick(selectedNode);
            workspaceController.$scope.$digest();

            expect(selectedNode.path).toHaveBeenCalled();
            expect(workspaceController.$progress.start).toHaveBeenCalled();
            expect(workspaceController.$$patchChildren).toHaveBeenCalled();
            expect(workspaceController.$state.go).toHaveBeenCalledWith('node', {
                repository: 'test',
                workspace: 'default',
                path: '/test'
            });
            expect(workspaceController.$progress.done).toHaveBeenCalled();
            expect(deferred.resolve).toHaveBeenCalled();
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            spyOn(workspaceController, '$$destroy').andCallThrough();

            expect(workspaceController.$$destroy).not.toHaveBeenCalled();
            workspaceController.$scope.$destroy();

            expect(removeTreeListener).toHaveBeenCalled();
            expect(workspaceController.$$destroy).toHaveBeenCalled();
            expect(workspaceController.$scope).toBeUndefined();
            expect(workspaceController.$tree).toBeUndefined();
            expect(workspaceController.$q).toBeUndefined();
            expect(workspaceController.$state).toBeUndefined();
            expect(workspaceController.$graph).toBeUndefined();
            expect(workspaceController.$treeFactory).toBeUndefined();
            expect(workspaceController.$progress).toBeUndefined();
        });
    });
});
