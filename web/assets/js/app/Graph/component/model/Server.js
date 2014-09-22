define([
    'app/Graph/component/model/Repository'
], function(Repository) {
    'use strict';

    function Server(restangularizedElement) {
        this.repositoriesCollection = restangularizedElement.all('repositories');
    }

    Server.prototype.getRepositories = function(cache) {
        cache = cache !== undefined ? !!cache : true

        return this.repositoriesCollection
            .withHttpConfig({ cache: cache })
            .getList()
            .then(function(repositories) {
                return repositories.map(function(repository) {
                    return new Repository(repository);
                });
            });
    };

    Server.prototype.getRepository = function(name, cache) {
        cache = cache !== undefined ? !!cache : true

        return this.repositoriesCollection
            .one(name)
            .withHttpConfig({ cache: cache })
            .get()
            .then(function(repository) {
                return new Repository(repository);
            });
    };

    return Server;
});
