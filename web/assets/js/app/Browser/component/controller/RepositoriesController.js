define([], function () {
    "use strict";

    /**
     *
     * @param {$scope} $scope
     * @constructor
     */
    function RepositoriesController($scope, $state, $graph, $search, $fuzzyFilter) {
        this.$scope = $scope;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;
        this.$fuzzyFilter = $fuzzyFilter;

        this.$$init();
    }

    RepositoriesController.prototype.$$init = function() {
        var self = this;
        this.repositories = {};

        this.$graph.find().then(function(repositories) {
            angular.forEach(repositories, function(repository) {
                self.repositories[repository.name] = repository;
            });

            self.$$updateRepositories();
        });

        this.cancelSearchListener = this.$search.registerListener(function(search) {
            if (self.search !== search) {
                self.search = search;
                self.$$updateRepositories();
            }
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });
    };

     RepositoriesController.prototype.$$updateRepositories = function() {
        var filteredRepositoriesNames = this.$fuzzyFilter(Object.keys(this.repositories), this.search),
            repositories = [],
            self = this;

        angular.forEach(filteredRepositoriesNames, function(repositoryName) {
            repositories.push(self.repositories[repositoryName]);
        });

        this.$scope.repositories = repositories;
    };

    RepositoriesController.prototype.openRepository = function(repository) {
        this.$state.go('repository', {
            repository: repository.name
        });
    };

    RepositoriesController.prototype.$$destroy = function() {
        this.cancelSearchListener();

        this.$scope = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$search = undefined;
        this.$fuzzyFilter = undefined;
    };

    RepositoriesController.$inject = ['$scope', '$state', '$graph', '$search', '$fuzzyFilter'];

    return RepositoriesController;
});
