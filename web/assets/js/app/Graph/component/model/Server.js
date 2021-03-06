define([
    'app/Graph/component/model/Repository'
], function(Repository) {
    'use strict';

    function Server(restangularizedElement) {
        this.repositoriesCollection = restangularizedElement.all('repositories');
    }

    Server.prototype.getRepositories = function(config) {
        return this.repositoriesCollection
            .withHttpConfig(config)
            .getList()
            .then(function(repositories) {
                return repositories.map(function(repository) {
                    return new Repository(repository);
                });
            });
    };

    Server.prototype.getRepository = function(name, config) {
        return this.repositoriesCollection
            .one(name)
            .withHttpConfig(config)
            .get()
            .then(function(repository) {
                return new Repository(repository);
            });
    };

    return Server;
});
