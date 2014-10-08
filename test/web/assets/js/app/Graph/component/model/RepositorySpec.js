/*global describe,it,expect,beforeEach*/
define([
    'app/Graph/component/model/Repository',
    'app/Graph/component/model/Workspace',
    'mock/Restangular'
], function(Repository, Workspace, Restangular) {
    'use strict';

    describe('Repository', function() {
        var restangular,
            repository,
            workspaces
        ;

        beforeEach(function() {
            workspaces = [new Restangular()];

            restangular = new Restangular(workspaces, workspaces[0]);

            spyOn(restangular, 'all').andCallThrough();

            repository = new Repository(restangular);
        });


        it('should call Restangular.all to get workspaces collection', function() {
            expect(restangular.all).toHaveBeenCalledWith('workspaces');
        });

        it('should call getList when getWorkspaces is called and return a Workspace list', function() {
            spyOn(restangular, 'withHttpConfig').andCallThrough();
            spyOn(restangular, 'getList').andCallThrough();

            repository.getWorkspaces({ cache: true }).then(function(_workspaces) {
                // As we use our mock, the promises are always resolved synchronously
                expect(restangular.withHttpConfig).toHaveBeenCalledWith({ cache: true });
                expect(restangular.getList).toHaveBeenCalled();
                expect(_workspaces[0] instanceof Workspace).toBe(true);
            });
        });

        it('should call get when getWorkspace is called and return a Workspace', function() {
            spyOn(restangular, 'withHttpConfig').andCallThrough();
            spyOn(restangular, 'one').andCallThrough();
            spyOn(restangular, 'get').andCallThrough();

            repository.getWorkspace('test', { cache: true }).then(function(repository) {
                // As we use our mock, the promises are always resolved synchronously
                expect(restangular.withHttpConfig).toHaveBeenCalledWith({ cache: true });
                expect(restangular.one).toHaveBeenCalledWith('test');
                expect(restangular.get).toHaveBeenCalled();
                expect(repository instanceof Workspace).toBe(true);
            });
        });

        it('should call post when createWorkspace is called', function() {
            spyOn(restangular, 'post').andCallThrough();

            repository.createWorkspace({ name: 'test'}).then(function() {
                // As we use our mock, the promises are always resolved synchronously
                expect(restangular.post).toHaveBeenCalledWith({ name: 'test'});
            });
        });
    });
});
