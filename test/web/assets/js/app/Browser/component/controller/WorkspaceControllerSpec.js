/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/controller/WorkspaceController',
    'mock/Graph',
    'mock/TreeFactory',
    'mock/NotificationFactory',
    'mixin',
    'angular',
    'angular-mocks'
], function(WorkspaceController, Graph, TreeFactory, NotificationFactory, mixin, angular) {
    'use strict';

    describe('WorkspaceController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $tree,
            $q,
            $state,
            $graph,
            $treeFactory,
            $notify,
            workspaceController,
            removeTreeListener,
            tree
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();
            spyOn($scope, '$on').andCallThrough();

            tree = {
                find: jasmine.createSpy('find').andReturn(mixin.buildPromise('test'))
            };

            removeTreeListener = jasmine.createSpy('removeTreeListener');
            $tree = {
                notified: jasmine.createSpy('notified').andCallFake(function(listener) {
                    listener(tree);

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

            $notify = jasmine.createSpy('$notify').andReturn(NotificationFactory());

            workspaceController = new WorkspaceController(
                $scope,
                $tree,
                $q,
                $state,
                $graph,
                $treeFactory,
                $notify
            );
        });

        it('should add a listener to $tree', function() {
            expect(workspaceController.$tree.notified).toHaveBeenCalledWith(jasmine.any(Function));
            expect(workspaceController.$scope.tree).toEqual(tree);
        });

        it('should add a listener to $elementDropSuccess event', function() {
            expect(workspaceController.$scope.$on).toHaveBeenCalledWith('$elementDropSuccess', jasmine.any(Function));

            spyOn(workspaceController, '$$treeRemove');
            spyOn(workspaceController, '$$treeMove');

            workspaceController.$scope.$broadcast('$elementDropSuccess', {
                draggableData: {},
                droppableData: {},
            });

            expect(workspaceController.$notify).not.toHaveBeenCalled();
            expect(workspaceController.$$treeRemove).not.toHaveBeenCalled();
            expect(workspaceController.$$treeMove).not.toHaveBeenCalled();

            workspaceController.$notify.reset();

            workspaceController.$scope.$broadcast('$elementDropSuccess', {
                draggableData: {
                    tree: {}
                },
                droppableData: {},
            });

            expect(workspaceController.$notify).toHaveBeenCalled();
            expect(workspaceController.$$treeRemove).not.toHaveBeenCalled();
            expect(workspaceController.$$treeMove).not.toHaveBeenCalled();

            workspaceController.$notify.reset();

            workspaceController.$scope.$broadcast('$elementDropSuccess', {
                draggableData: {},
                droppableData: {
                    tree: {}
                },
            });

            expect(workspaceController.$notify).toHaveBeenCalled();
            expect(workspaceController.$$treeRemove).not.toHaveBeenCalled();
            expect(workspaceController.$$treeMove).not.toHaveBeenCalled();

            workspaceController.$scope.$broadcast('$elementDropSuccess', {
                draggableData: {
                    tree: {
                        path: '/test'
                    }
                },
                droppableData: {
                    trash: {}
                },
            });

            expect(workspaceController.$$treeRemove).toHaveBeenCalledWith('test');
            expect(workspaceController.$scope.tree.find).toHaveBeenCalledWith('/root/test');

            workspaceController.$scope.tree.find.reset();

            workspaceController.$scope.$broadcast('$elementDropSuccess', {
                draggableData: {
                    tree: {
                        path: '/test'
                    }
                },
                droppableData: {
                    tree: {
                        path: '/toto'
                    }
                },
            });
            workspaceController.$scope.$digest();
            expect(workspaceController.$$treeMove).toHaveBeenCalledWith('test', 'test');
            expect(workspaceController.$scope.tree.find).toHaveBeenCalledWith('/root/test');
            expect(workspaceController.$scope.tree.find).toHaveBeenCalledWith('/root/toto');
        });

        it('should add a listener to $treeCreate event', function() {
            expect(workspaceController.$scope.$on).toHaveBeenCalledWith('$treeCreate', jasmine.any(Function));

            spyOn(workspaceController, '$$treeCreate');

            workspaceController.$scope.$broadcast('$treeCreate', {
                parent: 'p',
                child: 'c',
                hide: 'h'
            });

            expect(workspaceController.$$treeCreate).toHaveBeenCalledWith('p', 'c', 'h');
        });

        it('should call $state.go when treeClick is called', function() {
            var selectedNode = {
                path: jasmine.createSpy('path').andReturn('/root/test'),
            };

            workspaceController.treeClick(mixin.buildPromise(selectedNode));

            expect(selectedNode.path).toHaveBeenCalled();
            expect(workspaceController.$state.go).toHaveBeenCalledWith('node', {
                repository: 'test',
                workspace: 'default',
                path: '/test'
            });
        });

        it('should call tree.moveTo when $$treeMove is called', function() {
            spyOn(workspaceController, '$$triggerTreeClick');
            spyOn($treeFactory, 'walkChildren');

            var parent = {
                append: jasmine.createSpy('append'),
                attr: jasmine.createSpy('attr'),
                path: jasmine.createSpy('path').andReturn('/root/test'),
                data: jasmine.createSpy('data').andReturn({
                    children: []
                })
            };

            var tree = {
                append: jasmine.createSpy('append'),
                attr: jasmine.createSpy('attr'),
                path: jasmine.createSpy('path').andReturn('/root/test/toto'),
                parent: jasmine.createSpy('parent').andReturn(parent),
                moveTo: jasmine.createSpy('moveTo').andReturn(mixin.buildPromise())
            };

            var treeDestination = {
                append: jasmine.createSpy('append'),
                attr: jasmine.createSpy('attr'),
                path: jasmine.createSpy('path').andReturn('/root/test/tata'),
            };

            workspaceController.$$treeMove(tree, treeDestination);

            expect(tree.moveTo).toHaveBeenCalledWith(treeDestination);
            expect($treeFactory.walkChildren).toHaveBeenCalledWith(treeDestination, jasmine.any(Function));
            expect(parent.attr).toHaveBeenCalledWith('hasChildren', false);
            expect(treeDestination.attr).toHaveBeenCalledWith('hasChildren', true);
            expect(workspaceController.$$triggerTreeClick.calls[0].args).toEqual([treeDestination]);
            expect(workspaceController.$$triggerTreeClick.calls[1].args).toEqual([tree]);
            expect(workspaceController.$notify).toHaveBeenCalled();
        });

        it('should call parent.append when $$treeCreate is called', function() {
            spyOn(workspaceController, '$$triggerTreeClick');
            spyOn($treeFactory, 'walkChildren');

            var parent = {
                append: jasmine.createSpy('append').andReturn(mixin.buildPromise()),
                attr: jasmine.createSpy('attr'),
                path: jasmine.createSpy('path').andReturn('/root/test')
            };

            var tree = {};

            var hideCallback = jasmine.createSpy('hideCallback');

            workspaceController.$$treeCreate(parent, tree, hideCallback);

            expect(parent.append).toHaveBeenCalledWith(tree);
            expect($treeFactory.walkChildren).toHaveBeenCalledWith(parent, jasmine.any(Function));
            expect(parent.attr).toHaveBeenCalledWith('hasChildren', true);
            expect(hideCallback).toHaveBeenCalled();
            expect(workspaceController.$notify).toHaveBeenCalled();
            expect(workspaceController.$$triggerTreeClick.calls[0].args).toEqual([parent]);
            expect(workspaceController.$$triggerTreeClick.calls[1].args).toEqual([tree]);
        });

        it('should call tree.remove when $$treeRemove is called', function() {
            var parent = {
                append: jasmine.createSpy('append'),
                attr: jasmine.createSpy('attr'),
                path: jasmine.createSpy('path').andReturn('/root/test'),
                data: jasmine.createSpy('data').andReturn({
                    children: []
                })
            };

            var tree = {
                parent: jasmine.createSpy('parent').andReturn(parent),
                remove: jasmine.createSpy('remove').andReturn(mixin.buildPromise()),
                path: jasmine.createSpy('path').andReturn('/root/test/toto')
            };

            spyOn(workspaceController, '$$triggerTreeClick');

            workspaceController.$$treeRemove(tree);

            expect(tree.remove).toHaveBeenCalled();
            expect(parent.attr).toHaveBeenCalledWith('hasChildren', false);

            expect(workspaceController.$notify).toHaveBeenCalled();
            expect(workspaceController.$$triggerTreeClick).not.toHaveBeenCalled()
        });

        it('should call treeClick and then set collapsed attribute to false when $$triggerTreeClick is called', function() {
            spyOn(workspaceController, 'treeClick').andReturn(mixin.buildPromise());

            var promise = mixin.buildPromise();
            spyOn(workspaceController.$q, 'when').andReturn(promise);

            var tree = {
                attr: jasmine.createSpy('attr')
            };

            workspaceController.$$triggerTreeClick(tree);

            expect(workspaceController.treeClick).toHaveBeenCalledWith(promise, undefined);
            expect(tree.attr).toHaveBeenCalledWith('collapsed', false);
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
            expect(workspaceController.$notify).toBeUndefined();
        });
    });
});
