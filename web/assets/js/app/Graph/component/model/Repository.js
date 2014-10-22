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

    Repository.prototype.getWorkspaces = function(config) {
        var self = this;

        return this.workspacesCollection
            .withHttpConfig(config)
            .getList()
            .then(function(workspaces) {
                return workspaces.map(function(workspace) {
                    return new Workspace(workspace, self);
                });
            });
    };

    Repository.prototype.getWorkspace = function(name, config) {
        var self = this;

        return this.workspacesCollection
            .one(name)
            .withHttpConfig(config)
            .get()
            .then(function(workspace) {
                return new Workspace(workspace, self);
            });
    };

    Repository.prototype.createWorkspace = function(workspace) {
        return this.workspacesCollection.post(workspace);
    };

    Repository.prototype.hasSupportedOperation = function(name) {
        return this.supportedOperations.indexOf(name) !== -1;
    };

    return Repository;
});
