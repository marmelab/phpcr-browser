/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/controller/RepositoriesController',
    'mock/Graph',
    'mock/Search',
    'mixin',
    'angular',
    'angular-mocks'
], function(RepositoriesController, Graph, Search, mixin, angular) {
    'use strict';

    describe('RepositoriesController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $state,
            $graph,
            $search,
            $fuzzyFilter,
            repositoriesController,
            searchListener,
            removeSearchListener
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            $state = {
                go: jasmine.createSpy('go')
            };

            $graph = new Graph();
            spyOn($graph, 'find').andReturn(mixin.buildPromise([
                { name: 'test'}
            ]));

            $search = new Search();
            removeSearchListener = jasmine.createSpy('removeSearchListener');
            spyOn($search, 'registerListener').andCallFake(function(listener) {
                searchListener = listener;
                return removeSearchListener;
            });

            $fuzzyFilter = jasmine.createSpy('$fuzzyFilter').andReturn(['test']);

            repositoriesController = new RepositoriesController(
                $scope,
                $state,
                $graph,
                $search,
                $fuzzyFilter
            );
        });

        it('should call $graph.find to set repositoriesController.repositories and build $scope.repositories', function() {
            expect(repositoriesController.$graph.find).toHaveBeenCalledWith();
            // As we use our mock, the promises are always resolved synchronously
            expect(repositoriesController.repositories).toEqual({
                'test': { name : 'test' }
            })

            expect(repositoriesController.$fuzzyFilter).toHaveBeenCalledWith(['test'], null);
            expect(repositoriesController.$scope.repositories).toEqual([
                { name : 'test' }
            ]);

            expect(repositoriesController.$search.registerListener).toHaveBeenCalledWith(searchListener);
        });

        it('should call $$filterRepositories when searchListener is called', function() {
            spyOn(repositoriesController, '$$filterRepositories').andCallThrough();

            searchListener('searching...');
            expect(repositoriesController.search).toBe('searching...');
            expect(repositoriesController.$$filterRepositories).toHaveBeenCalled();
            expect(repositoriesController.$fuzzyFilter).toHaveBeenCalledWith(['test'], 'searching...');

            // Same string, it should not call $$filterRepositories
            searchListener('searching...');
            expect(repositoriesController.$$filterRepositories.callCount).toBe(1); // the init call is not spied yet
        });

         it('should call $state.go when openRepository is called', function() {
            repositoriesController.openRepository({ name: 'test' });
            expect(repositoriesController.$state.go).toHaveBeenCalledWith('repository', {
                repository: 'test'
            });
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            spyOn(repositoriesController, '$$destroy').andCallThrough();

            expect(repositoriesController.$$destroy).not.toHaveBeenCalled();
            repositoriesController.$scope.$destroy();

            expect(removeSearchListener).toHaveBeenCalled();
            expect(repositoriesController.$$destroy).toHaveBeenCalled();
            expect(repositoriesController.$scope).toBeUndefined();
            expect(repositoriesController.$state).toBeUndefined();
            expect(repositoriesController.$graph).toBeUndefined();
            expect(repositoriesController.$search).toBeUndefined();
            expect(repositoriesController.$fuzzyFilter).toBeUndefined();
            expect(repositoriesController.search).toBeUndefined();
        });
    });
});
