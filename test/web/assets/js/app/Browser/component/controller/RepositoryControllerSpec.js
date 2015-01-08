/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/controller/RepositoryController',
    'mock/Graph',
    'mock/Search',
    'mock/NotificationFactory',
    'mixin',
    'angular',
    'angular-mocks'
], function(RepositoryController, Graph, Search, NotificationFactory, mixin, angular) {
    'use strict';

    describe('RepositoryController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $state,
            $graph,
            $search,
            $fuzzyFilter,
            $error,
            $success,
            $errorFromResponse,
            repositoryController,
            repository,
            searchListener,
            removeSearchListener
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            $state = {
                params: {
                    repository: 'test'
                },
                go: jasmine.createSpy('go')
            };

            $graph = new Graph();
            repository = {
                getWorkspaces: jasmine.createSpy('getWorkspaces').andReturn([
                    { name: 'default' }
                ]),
                createWorkspace: jasmine.createSpy('createWorkspace').andReturn(mixin.buildPromise())
            };
            spyOn($graph, 'find').andReturn(mixin.buildPromise(repository));

            $search = new Search();
            removeSearchListener = jasmine.createSpy('removeSearchListener');
            spyOn($search, 'registerListener').andCallFake(function(listener) {
                searchListener = listener;
                return removeSearchListener;
            });

            $fuzzyFilter = jasmine.createSpy('$fuzzyFilter').andReturn(['default']);

            $error = jasmine.createSpy('$error').andReturn(NotificationFactory());
            $success = jasmine.createSpy('$success').andReturn(NotificationFactory());
            $errorFromResponse = jasmine.createSpy('$errorFromResponse').andReturn(NotificationFactory());

            repositoryController = new RepositoryController(
                $scope,
                $state,
                $graph,
                $search,
                $fuzzyFilter,
                $success,
                $error,
                $errorFromResponse
            );
        });

        it('should init the $scope variables', function() {
            expect(repositoryController.$scope.isWorkspaceCreationFormDisplayed).toBe(false);
            expect(repositoryController.$scope.workspaceCreationForm).toEqual({
                name: null
            });
        });

        it('should call $graph.find to set repositoryController.workspaces and build $scope.workspaces', function() {
            expect(repositoryController.$graph.find).toHaveBeenCalledWith({ repository: 'test'});
            // As we use our mock, the promises are always resolved synchronously
            expect(repository.getWorkspaces).toHaveBeenCalledWith({ cache: true });

            expect(repositoryController.workspaces).toEqual({
                'default': { name : 'default' }
            })

            expect(repositoryController.$fuzzyFilter).toHaveBeenCalledWith(['default'], null);
            expect(repositoryController.$scope.workspaces).toEqual([
                { name : 'default' }
            ]);
        });

        it('should call $graph.find to set repositoryController.workspaces and build $scope.workspaces when $$loadWorkspaces is called', function() {
            spyOn(repositoryController, '$$filterWorkspaces').andCallThrough();

            repositoryController.$$loadWorkspaces(false);
            expect(repositoryController.$graph.find).toHaveBeenCalledWith({ repository: 'test'});
            expect(repositoryController.$graph.find.callCount).toBe(2);
            // As we use our mock, the promises are always resolved synchronously
            expect(repository.getWorkspaces).toHaveBeenCalledWith({ cache: false });

            expect(repositoryController.workspaces).toEqual({
                'default': { name : 'default' }
            })

            expect(repositoryController.$fuzzyFilter).toHaveBeenCalledWith(['default'], null);
            expect(repositoryController.$scope.workspaces).toEqual([
                { name : 'default' }
            ]);
            expect(repositoryController.$$filterWorkspaces).toHaveBeenCalled();
        });

        it('should call $$filterWorkspaces when searchListener is called', function() {
            spyOn(repositoryController, '$$filterWorkspaces').andCallThrough();

            searchListener('searching...');
            expect(repositoryController.search).toBe('searching...');
            expect(repositoryController.$$filterWorkspaces).toHaveBeenCalled();
            expect(repositoryController.$fuzzyFilter).toHaveBeenCalledWith(['default'], 'searching...');

            // Same string, it should not call $$filterWorkspaces
            searchListener('searching...');
            expect(repositoryController.$$filterWorkspaces.callCount).toBe(1); // the init call is not spied yet
        });

        it('should call $state.go when openWorkspace is called', function() {
            var workspace = {
                name: 'default',
                getRepository: jasmine.createSpy('getRepository').andReturn({ name: 'test' })
            };

            repositoryController.openWorkspace(workspace);
            expect(workspace.getRepository).toHaveBeenCalled();
            expect(repositoryController.$state.go).toHaveBeenCalledWith('node', {
                repository: 'test',
                workspace: 'default',
                path: '/'
            });
        });

        it('should call $notification.error when createWorkspace is called and $scope.workspaceCreationForm is null', function() {
            repositoryController.createWorkspace();
            expect(repositoryController.$error).toHaveBeenCalled();
        });

        it('should call repository.createWorkspace when createWorkspace is called and $scope.workspaceCreationForm is not null', function() {
            spyOn(repositoryController, 'hideWorkspaceCreationForm');
            spyOn(repositoryController, '$$loadWorkspaces');

            repositoryController.$scope.workspaceCreationForm.name = 'Hey';

            repositoryController.createWorkspace();
            expect(repository.createWorkspace).toHaveBeenCalledWith({ name: 'Hey' });
            expect(repositoryController.$success).toHaveBeenCalled();
            expect(repositoryController.hideWorkspaceCreationForm).toHaveBeenCalled();
            expect(repositoryController.$$loadWorkspaces).toHaveBeenCalledWith(false);
            expect(repositoryController.$$loadWorkspaces.callCount).toBe(1); // the init call is not spied yet
        });

        it('should set $scope.isWorkspaceCreationFormDisplayed to true when showWorkspaceCreationForm is called', function() {
            expect(repositoryController.$scope.isWorkspaceCreationFormDisplayed).toBe(false);
            repositoryController.showWorkspaceCreationForm();
            expect(repositoryController.$scope.isWorkspaceCreationFormDisplayed).toBe(true);
        });

        it('should set $scope.isWorkspaceCreationFormDisplayed to false and $scope.workspaceCreationForm.name to null when hideWorkspaceCreationForm is called', function() {
            repositoryController.$scope.isWorkspaceCreationFormDisplayed = true;
            repositoryController.$scope.workspaceCreationForm.name = 'Hey';
            repositoryController.hideWorkspaceCreationForm();
            expect(repositoryController.$scope.isWorkspaceCreationFormDisplayed).toBe(false);
            expect(repositoryController.$scope.workspaceCreationForm.name).toBeNull();
        });

        it('should call workspace.remove when $$removeWorkspace is called', function() {
            spyOn(repositoryController, '$$loadWorkspaces');

            var workspace = {
                remove: jasmine.createSpy('remove').andReturn(mixin.buildPromise())
            };

            repositoryController.$$removeWorkspace(workspace);
            expect(workspace.remove).toHaveBeenCalled();
            expect(repositoryController.$success).toHaveBeenCalled();
            expect(repositoryController.$$loadWorkspaces).toHaveBeenCalledWith(false);
            expect(repositoryController.$$loadWorkspaces.callCount).toBe(1); // the init call is not spied yet
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            spyOn(repositoryController, '$$destroy').andCallThrough();

            expect(repositoryController.$$destroy).not.toHaveBeenCalled();
            repositoryController.$scope.$destroy();

            expect(removeSearchListener).toHaveBeenCalled();
            expect(repositoryController.$$destroy).toHaveBeenCalled();
            expect(repositoryController.$scope).toBeUndefined();
            expect(repositoryController.$state).toBeUndefined();
            expect(repositoryController.$graph).toBeUndefined();
            expect(repositoryController.$search).toBeUndefined();
            expect(repositoryController.$fuzzyFilter).toBeUndefined();
            expect(repositoryController.$success).toBeUndefined();
            expect(repositoryController.$error).toBeUndefined();
            expect(repositoryController.$errorFromResponse).toBeUndefined();
            expect(repositoryController.search).toBeUndefined();
        });
    });
});
