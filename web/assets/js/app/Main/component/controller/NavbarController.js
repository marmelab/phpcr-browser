define([], function () {
    "use strict";

    /**
     *
     * @param {$scope} $scope
     * @constructor
     */
    function NavbarController($scope, $translate, $state, $graph, $search) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;

        this.$$init();
    }

    NavbarController.prototype.$$init = function() {
        var self = this;

        this.$scope.$translate = this.$translate;
        this.$scope.$state = this.$state;

        this.$scope.menu = {};

        this.$scope.$watch('search', function(value) {
            self.$search.notify(value);
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });

        this.$$buildMenu();

        this.$scope.$on('$stateChangeSuccess', function() {
            self.$$buildMenu();
        });
    };

    NavbarController.prototype.$$buildMenu = function() {
        this.$scope.menu = {};

        this.$$buildMenuRepositories();

        if (this.$state.params.repository) {
            this.$$buildMenuRepository();
        }

        if (this.$state.current.name === 'node') {
            this.$scope.menu.workspace = this.$state.params.workspace;
        }
    }

    NavbarController.prototype.$$buildMenuRepositories = function() {
        var self = this;

        this.$graph
            .find()
            .then(function(repositories) {
                self.$scope.menu.repositories = repositories;
            })
        ;
    };

    NavbarController.prototype.$$buildMenuRepository = function() {
        var self = this;

        this.$graph
            .find({
                repository: this.$state.params.repository
            })
            .then(function(repository) {
                return repository.getWorkspaces();
            })
            .then(function(workspaces) {
                self.$scope.menu.workspaces = workspaces;
            })
        ;
    };

    NavbarController.prototype.toggleCollapsed = function() {
        this.navbarCollapsed = !this.navbarCollapsed;
    };

    NavbarController.prototype.isPreferredLanguage = function(key) {
        return this.$translate.use() === key;
    };

    NavbarController.prototype.changeLanguage = function(key) {
        return this.$translate.use(key);
    };

    NavbarController.prototype.$$destroy = function() {
        this.$scope = undefined;
        this.$translate = undefined;
        this.$state = undefined;
    };

    NavbarController.$inject = ['$scope', '$translate', '$state', '$graph', '$search'];

    return NavbarController;
});
