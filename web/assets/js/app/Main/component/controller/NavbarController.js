define([], function () {
    "use strict";

    /**
     *
     * @param {$scope} $scope
     * @constructor
     */
    function NavbarController($scope, $translate, $state, $graph, $search, $rootScope) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;
        this.$rootScope = $rootScope;

        this.$$init();
    }

    NavbarController.prototype.$$init = function() {
        var self = this;

        this.$scope.$translate = this.$translate;
        this.$scope.$state = this.$state;
        this.$scope.offlineStatus = false;
        this.$scope.navbarCollapsed = true;

        this.$rootScope.sidebarDisplayed = false;

        this.$scope.$watch('search', function(value) {
            self.$search.notify(value || null);
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });

        this.$$buildMenu();

        this.$scope.$on('$stateChangeSuccess', function() {
            self.$$buildMenu();
            self.$scope.offlineStatus = false;
            self.$scope.navbarCollapsed = true;
        });

        this.$scope.$on('$offlineStatusUpdate', function($event, status) {
            self.$scope.offlineStatus = status;
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

    NavbarController.prototype.toggleNavbarCollapsed = function() {
        this.$scope.navbarCollapsed = !this.$scope.navbarCollapsed;
    };

    NavbarController.prototype.toggleSidebarDisplayed = function() {
        this.$rootScope.sidebarDisplayed = !this.$rootScope.sidebarDisplayed;
    };

    NavbarController.prototype.$$destroy = function() {
        this.$scope = undefined;
        this.$translate = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$search = undefined;
        this.$rootScope = undefined;
    };

    NavbarController.$inject = ['$scope', '$translate', '$state', '$graph', '$search', '$rootScope'];

    return NavbarController;
});
