/*global describe,it,expect,beforeEach*/
define([
    'app/Graph/component/model/Server',
    'app/Graph/component/service/Graph',
    'mock/Restangular',
    'angular',
    'angular-mocks'
], function(Server, Graph, Restangular, angular) {
    'use strict';

    var injector = angular.injector(['ngMock']),
        $cacheFactory = injector.get('$cacheFactory'),
        nodeRestangular,
        workspaceRestangular,
        repositoryRestangular,
        restangular,
        $graph
    ;

    beforeEach(function() {
        nodeRestangular = new Restangular();

        workspaceRestangular = new Restangular(null, nodeRestangular);

        repositoryRestangular = new Restangular(null, workspaceRestangular);

        restangular = new Restangular(null, repositoryRestangular);

        spyOn(restangular, 'setBaseUrl').andCallThrough();

        $graph = new Graph(restangular, $cacheFactory);
    });

    describe('Graph', function() {
        it('should call Restangular.setBaseUrl and create a Server instance', function() {
            expect(restangular.setBaseUrl).toHaveBeenCalledWith('/index.php/api');
            expect($graph.server instanceof Server).toBe(true);
        });

        it('should call server.getRepositories if query is empty', function() {
            spyOn($graph.server, 'getRepositories').andCallThrough();

            $graph.find().then(function() {
                // As we use our mock, the promises are always resolved synchronously
                expect($graph.server.getRepositories).toHaveBeenCalledWith({});
            });
        });

        it('should call $$findRepository if query has a repository name', function() {
            spyOn($graph, '$$findRepository').andCallThrough();

            $graph.find({ repository: 'test'}).then(function() {
                // As we use our mock, the promises are always resolved synchronously
                expect($graph.$$findRepository).toHaveBeenCalledWith('test', {});
            });
        });

        it('should call $$findWorkspace if query has a repository name and a workspace name', function() {
            spyOn($graph, '$$findWorkspace').andCallThrough();

            $graph.find({ repository: 'test', workspace: 'default'}).then(function() {
                // As we use our mock, the promises are always resolved synchronously
                expect($graph.$$findWorkspace).toHaveBeenCalledWith('test', 'default', {});
            });
        });

        it('should call $$findNode if query has a repository name and a workspace name and a path', function() {
            spyOn($graph, '$$findNode').andCallThrough();

            $graph.find({ repository: 'test', workspace: 'default', path: '/toto'}, { reducedTree: false }).then(function() {
                // As we use our mock, the promises are always resolved synchronously
                expect($graph.$$findNode).toHaveBeenCalledWith('test', 'default', '/toto', false);
            });
        });

        it('should call $$invalidateCacheEntry if cache config is setted to false', function() {
            spyOn($graph, '$$invalidateCacheEntry').andCallThrough();

            var $httpCache = {
                remove: jasmine.createSpy('remove')
            };

            spyOn($cacheFactory, 'get').andReturn($httpCache);

            $graph.find({ repository: 'test', workspace: 'default', path: '/toto' }, { cache: false }).then(function() {
                // As we use our mock, the promises are always resolved synchronously
                expect($graph.$$invalidateCacheEntry).toHaveBeenCalledWith('/index.php/api/repositories/test/workspaces/default/nodes/toto');
                expect($cacheFactory.get).toHaveBeenCalledWith('$http');
                expect($httpCache.remove).toHaveBeenCalledWith('/index.php/api/repositories/test/workspaces/default/nodes/toto');
            });
        });
    });
});
