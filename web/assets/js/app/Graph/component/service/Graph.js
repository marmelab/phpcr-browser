define([
    'app/Graph/component/model/Server'
], function(Server) {
    'use strict';

    function Graph(Restangular) {
       this.Restangular = Restangular;

       this.$$init();
    }

    Graph.prototype.$$init = function() {
        this.Restangular.setBaseUrl('/index.php/api');

        this.server = new Server(this.Restangular);
    };

    Graph.prototype.$$findRepository = function(name, cache) {
        return this.server.getRepository(name, cache);
    };

    Graph.prototype.$$findWorkspace = function(repositoryName, name, cache) {
        return this.server
            .getRepository(repositoryName, cache)
            .then(function(repository) {
                return repository.getWorkspace(name, cache);
            })
        ;
    };

    Graph.prototype.$$findNode = function(repositoryName, workspaceName, path, reducedTree) {
        reducedTree = reducedTree !== undefined ? !!reducedTree : false;

        return this.server
            .getRepository(repositoryName)
            .then(function(repository) {
                return repository.getWorkspace(workspaceName);
            })
            .then(function(workspace) {
                return workspace.getNode(path, reducedTree);
            })
        ;
    };

    Graph.prototype.find = function(query, params) {
        query = query || {};
        params = params || {};

        if (!query.repository) {
            return this.server.getRepositories(params.cache);
        }

        if (!query.workspace) {
            return this.$$findRepository(query.repository);
        }

        if (!query.path) {
            return this.$$findWorkspace(
                query.repository,
                query.workspace,
                params.cache
            );
        }

        return this.$$findNode(
            query.repository,
            query.workspace,
            query.path,
            params.reducedTree
        );
    };

    Graph.$inject = ['Restangular'];

    return Graph;
});
