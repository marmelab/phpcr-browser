define([
    'angular'
], function (angular) {
    'use strict';

    /**
     *
     * @param {$scope} $scope
     * @constructor
     */
    function RepositoryController($scope, $state, $graph, $search, $fuzzyFilter) {
        this.$scope = $scope;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;
        this.$fuzzyFilter = $fuzzyFilter;

        this.$$init();
    }

    RepositoryController.prototype.$$init = function() {
        var self = this;
        this.displayCreateForm = false;
        this.workspaces = {};

        this.$graph.find(this.$state.params).then(function(repository) {
            return repository.getWorkspaces();
        }).then(function(workspaces) {
            angular.forEach(workspaces, function(workspace) {
                self.workspaces[workspace.name] = workspace;
            });

            self.$$updateWorkspaces();
        });

        this.cancelSearchListener = this.$search.registerListener(function(search) {
            if (search && self.search !== search) {
                self.search = search;
                self.$$updateWorkspaces();
            }
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });
    };

    RepositoryController.prototype.$$updateWorkspaces = function() {
        var filteredWorkspaceNames = this.$fuzzyFilter(Object.keys(this.workspaces), this.search),
            workspaces = [],
            self = this;

        angular.forEach(filteredWorkspaceNames, function(workspaceName) {
            workspaces.push(self.workspaces[workspaceName]);
        });

        this.$scope.workspaces = workspaces;
    };

    RepositoryController.prototype.openWorkspace = function(workspace) {
        this.$state.go('node', {
            repository: workspace.getRepository().name,
            workspace: workspace.name,
            path: '/' // If not provided, it make the NodeController to be created then destroy then created
        });
    };

    RepositoryController.prototype.$$destroy = function() {
        this.cancelSearchListener();

        this.$scope = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$search = undefined;
        this.$fuzzyFilter = undefined;
    };

    RepositoryController.$inject = ['$scope', '$state', '$graph', '$search', '$fuzzyFilter'];

    return RepositoryController;
});
