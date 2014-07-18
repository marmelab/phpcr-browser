define([
    'app/Graph/component/model/Repository'
], function(Repository) {
    'use strict';

    function Server(restangularizedElement) {
        this.repositoriesCollection = restangularizedElement.all('repositories');
    }

    Server.prototype.getRepositories = function() {
        return this.repositoriesCollection
            .getList()
            .then(function(repositories) {
                return repositories.map(function(repository) {
                    return new Repository(repository);
                });
            });
    };

    Server.prototype.getRepository = function(name) {
        return this.repositoriesCollection
            .one(name)
            .get()
            .then(function(repository) {
                return new Repository(repository);
            });
    };

    return Server;
});
