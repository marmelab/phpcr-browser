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

    Repository.prototype.getWorkspaces = function() {
        var self = this;
        return this.workspacesCollection
            .getList()
            .then(function(workspaces) {
                return workspaces.map(function(workspace) {
                    return new Workspace(workspace, self);
                });
            });
    };

    Repository.prototype.getWorkspace = function(name) {
        var self = this;
        return this.workspacesCollection
            .one(name)
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
