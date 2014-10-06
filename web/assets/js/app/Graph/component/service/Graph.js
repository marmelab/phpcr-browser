define([
    'lodash',
    'app/Graph/component/model/Server'
], function(_, Server) {
    'use strict';

    function Graph(Restangular, $cacheFactory) {
       this.Restangular = Restangular;
       this.$cacheFactory = $cacheFactory;

       this.$$init();
    }

    Graph.prototype.$$init = function() {
        this.baseUrl = '/index.php/api';

        this.Restangular.setBaseUrl(this.baseUrl);

        this.server = new Server(this.Restangular);
    };

    Graph.prototype.$$invalidateCacheEntry = function(key) {
        this.$cacheFactory.get('$http').remove(key);
    };

    Graph.prototype.$$findRepository = function(name, config) {
        return this.server.getRepository(name, config);
    };

    Graph.prototype.$$findWorkspace = function(repositoryName, name, config) {
        return this.server
            .getRepository(repositoryName, config)
            .then(function(repository) {
                return repository.getWorkspace(name, config);
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

    Graph.prototype.find = function(query, config) {
        query = query || {};
        config = config || {};

        if (config.cache === false) {

            var key = this.baseUrl;

            if (query.repository) {
                key += '/repositories/' + query.repository;
            }

            if (query.workspace) {
                key += '/workspaces/' + query.workspace;
            }

            if (query.path) {
                key += '/nodes/' + query.path.slice(1);
            }

            // Invalidate the cache if the cache is set to false
            this.$$invalidateCacheEntry(key);
        }

        if (!query.repository) {
            return this.server.getRepositories(config);
        }

        if (!query.workspace) {
            return this.$$findRepository(query.repository, config);
        }

        if (!query.path) {
            return this.$$findWorkspace(
                query.repository,
                query.workspace,
                config
            );
        }

        return this.$$findNode(
            query.repository,
            query.workspace,
            query.path,
            config.reducedTree
        );
    };

    Graph.$inject = ['Restangular', '$cacheFactory'];

    return Graph;
});
