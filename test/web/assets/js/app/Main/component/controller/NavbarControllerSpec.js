/*global describe,it,expect,beforeEach*/
define([
    'app/Main/component/controller/NavbarController',
    'mock/Translate',
    'mock/Graph',
    'mock/Search',
    'mixin',
    'angular',
    'angular-mocks'
], function(NavbarController, Translate, Graph, Search, mixin, angular) {
    'use strict';

    describe('NavbarController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $translate,
            $state,
            $graph,
            $search,
            navbarController,
            repository
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();
            spyOn($scope, '$on').andCallThrough();
            spyOn($scope, '$watch').andCallThrough();

            $translate = new Translate();

            $state = {
                params: {
                    repository: 'test'
                },
                current: {
                    name: 'node'
                }
            };

            repository = {
                getWorkspaces: jasmine.createSpy('getWorkspaces').andReturn(mixin.buildPromise([
                    { name: 'default' }
                ]))
            };

            $graph = new Graph();
            spyOn($graph, 'find').andReturn(mixin.buildPromise(repository));

            $search = new Search();
            spyOn($search, 'notify').andCallThrough();

            navbarController = new NavbarController(
                $scope,
                $translate,
                $state,
                $graph,
                $search
            );

            spyOn(navbarController, '$$buildMenu').andCallThrough();
            spyOn(navbarController, '$$buildMenuRepository').andCallThrough();
            spyOn(navbarController, '$$buildMenuRepositories').andCallThrough();
            spyOn(navbarController, '$$destroy').andCallThrough();
        });

        it('should call expose $translate and $state on its $scope', function() {
            expect(navbarController.$scope.$translate).toBe($translate);
            expect(navbarController.$scope.$state).toBe($state);
        });

        it('should set $scope.offlineStatus to false on $$init and update it when event $offlineStatusUpdate is broadcasted', function() {
            expect(navbarController.$scope.offlineStatus).toBe(false);

            expect(navbarController.$scope.$on).toHaveBeenCalledWith('$offlineStatusUpdate', jasmine.any(Function));

            navbarController.$scope.$broadcast('$offlineStatusUpdate', true);
            expect(navbarController.$scope.offlineStatus).toBe(true);

            navbarController.$scope.$broadcast('$offlineStatusUpdate', false);
            expect(navbarController.$scope.offlineStatus).toBe(false);
        });

        it('should call $search.notify when $scope.search changes', function() {
            expect(navbarController.$scope.search).toBeUndefined();

            expect(navbarController.$scope.$watch).toHaveBeenCalledWith('search', jasmine.any(Function));

            navbarController.$scope.search = 'test';
            navbarController.$scope.$digest();

            expect(navbarController.$search.notify).toHaveBeenCalledWith('test');
        });

        it('should build menu and rebuild it when event $stateChangeSuccess is broadcasted', function() {
            expect(navbarController.$scope.$on).toHaveBeenCalledWith('$stateChangeSuccess', jasmine.any(Function));

            navbarController.$scope.offlineStatus = true;

            navbarController.$scope.$broadcast('$stateChangeSuccess');
            expect(navbarController.$$buildMenu.callCount).toBe(1);
            expect(navbarController.$scope.offlineStatus).toBe(false);
        });

        it('should invert $scope.navbarCollapsed when toggleNavbarCollapsed is called', function() {
            expect(navbarController.$scope.navbarCollapsed).toBe(true);
            navbarController.toggleNavbarCollapsed();
            expect(navbarController.$scope.navbarCollapsed).toBe(false);
            navbarController.toggleNavbarCollapsed();
            expect(navbarController.$scope.navbarCollapsed).toBe(true);
        });

        it('should call $$buildMenuRepositories when $$buildMenu is called', function() {
            navbarController.$$buildMenu();
            expect(navbarController.$$buildMenuRepositories).toHaveBeenCalled();

            // Because $state mock exposes a repository name
            expect(navbarController.$$buildMenuRepository).toHaveBeenCalled();
        });

        it('should call $graph.find when $$buildMenuRepositories is called', function() {
            navbarController.$$buildMenuRepositories();
            expect($graph.find).toHaveBeenCalledWith();
            // As we use our mock, the promises are always resolved synchronously
            expect(navbarController.$scope.menu.repositories).toBe(repository);
        });

        it('should call $graph.find when $$buildMenuRepository is called', function() {
            navbarController.$$buildMenuRepository();
            expect($graph.find).toHaveBeenCalledWith();
            // As we use our mock, the promises are always resolved synchronously
            expect(navbarController.$scope.menu.workspaces).toEqual([
                { name: 'default' }
            ]);
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            expect(navbarController.$$destroy).not.toHaveBeenCalled();
            $scope.$destroy();
            expect(navbarController.$$destroy).toHaveBeenCalled();
            expect(navbarController.$scope).toBeUndefined();
            expect(navbarController.$translate).toBeUndefined();
            expect(navbarController.$state).toBeUndefined();
            expect(navbarController.$graph).toBeUndefined();
            expect(navbarController.$search).toBeUndefined();
        });
    });
});
