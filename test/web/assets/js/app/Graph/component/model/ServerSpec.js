/*global describe,it,expect,beforeEach*/
define([
    'app/Graph/component/model/Server',
    'app/Graph/component/model/Repository',
    'mock/Restangular'
], function(Server, Repository, Restangular) {
    'use strict';

    var restangular,
        server,
        repositories
    ;

    beforeEach(function() {
        repositories = [new Restangular()];

        restangular = new Restangular(repositories, repositories[0]);

        spyOn(restangular, 'all').andCallThrough();

        server = new Server(restangular);
    });

    describe('Server', function() {
        it('should call Restangular.all to get repositories collection', function() {
            expect(restangular.all).toHaveBeenCalledWith('repositories');
        });

        it('should call getList when getRepositories is called and return a Repository list', function() {
            spyOn(restangular, 'withHttpConfig').andCallThrough();
            spyOn(restangular, 'getList').andCallThrough();

            server.getRepositories({ cache: true }).then(function(_repositories) {
                // As we use our mock, the promises are always resolved synchronously
                expect(restangular.withHttpConfig).toHaveBeenCalledWith({ cache: true });
                expect(restangular.getList).toHaveBeenCalled();
                expect(_repositories[0] instanceof Repository).toBe(true);
            });
        });

        it('should call get when getRepository is called and return a Repository', function() {
            spyOn(restangular, 'withHttpConfig').andCallThrough();
            spyOn(restangular, 'one').andCallThrough();
            spyOn(restangular, 'get').andCallThrough();

            server.getRepository('test', { cache: true }).then(function(repository) {
                // As we use our mock, the promises are always resolved synchronously
                expect(restangular.withHttpConfig).toHaveBeenCalledWith({ cache: true });
                expect(restangular.one).toHaveBeenCalledWith('test');
                expect(restangular.get).toHaveBeenCalled();
                expect(repository instanceof Repository).toBe(true);
            });
        });
    });
});
