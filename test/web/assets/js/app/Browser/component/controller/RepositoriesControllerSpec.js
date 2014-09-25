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
            respositoriesController
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            $state = {

            };

            $graph = new Graph();
            spyOn($graph, 'find').andReturn(mixin.buildPromise([
                { name: 'test '}
            ]));

            $search = new Search();
            var removeSearchListener = jasmine.createSpy('removeSearchListener');
            spyOn($search, 'registerListener').andReturn(removeSearchListener);

            $fuzzyFilter = jasmine.createSpy('$fuzzyFilter').andReturn([]);

            respositoriesController = new RepositoriesController(
                $scope,
                $state,
                $graph,
                $search,
                $fuzzyFilter
            );

            spyOn(respositoriesController, '$$destroy').andCallThrough();
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            expect(respositoriesController.$$destroy).not.toHaveBeenCalled();
            respositoriesController.$scope.$destroy();
            expect(respositoriesController.$$destroy).toHaveBeenCalled();
            expect(respositoriesController.$scope).toBeUndefined();
            expect(respositoriesController.$state).toBeUndefined();
            expect(respositoriesController.$graph).toBeUndefined();
            expect(respositoriesController.$search).toBeUndefined();
            expect(respositoriesController.$fuzzyFilter).toBeUndefined();
        });
    });
});
