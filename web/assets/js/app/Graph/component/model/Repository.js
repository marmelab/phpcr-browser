define([
    'app/Graph/component/model/Workspace'
], function(Workspace) {
    'use strict';

    function Repository(restangularizedElement) {
        this.name = restangularizedElement.name;
        this.factoryName = restangularizedElement.factoryName;
        this.supportedOperations = restangularizedElement.supportedOperations;

        this.workspacesCollection = restangularizedElement.all('workspaces');
    }

    Repository.prototype.getWorkspaces = function(cache) {
        var self = this;
        cache = cache !== undefined ? !!cache : true
        return this.workspacesCollection
            .withHttpConfig({ cache: cache })
            .getList()
            .then(function(workspaces) {
                return workspaces.map(function(workspace) {
                    return new Workspace(workspace, self);
                });
            });
    };

    Repository.prototype.getWorkspace = function(name, cache) {
        var self = this;
        cache = cache !== undefined ? !!cache : true

        return this.workspacesCollection
            .one(name)
            .withHttpConfig({ cache: cache })
            .get()
            .then(function(workspace) {
                return new Workspace(workspace, self);
            });
    };

    Repository.prototype.createWorkspace = function(workspace) {
        return this.workspacesCollection.post(workspace);
    };

    return Repository;
});
