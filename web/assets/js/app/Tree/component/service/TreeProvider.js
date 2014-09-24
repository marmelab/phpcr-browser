define([
    'angular'
], function(angular) {
    'use strict';

    function Tree(provider, $q, $rootScope, $state, $treeFactory, $graph, $progress) {
        this.provider = provider;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$treeFactory = $treeFactory;
        this.$graph = $graph;
        this.$progress = $progress;

        this.deferred = $q.defer();
        this.$$init();
    }

    Tree.prototype.$$init = function() {
        this.tree = null;

        if (this.$state.params.path !== undefined) {
            var path = this.$state.params.path === null || this.$state.params.path.length === 0 ? '/' : this.$state.params.path;
            this.$$create({
                repository: this.$state.params.repository,
                workspace: this.$state.params.workspace,
                path: path
            });
        }

        this.$$listenStateChange();
    };

    Tree.prototype.$$decorate = function(tree) {
        // TODO: Add hook listeners
        var current = tree;


        return tree;
    };

    Tree.prototype.$$create = function(findParams) {
        var self = this;

        this.$progress.start();

        this.$graph
            .find(findParams, { reducedTree: true })
            .then(function(node) {
                var root = node.reducedTree['/'];
                root.name = 'root';

                var tree = self.$treeFactory({
                    children: [root]
                });

                var current = tree.find('/root' + findParams.path);
                if (current) {
                    self.$treeFactory.activate(current);

                    do {
                        current.toggle('collapsed');
                    } while (current = current.parent());
                } else {
                    var root = tree.find('/root');
                    root.toggle('collapsed');
                    self.$treeFactory.activate(root);
                }

                self.tree = self.$$decorate(tree);
                return self.tree;
            })
            .then(
                self.deferred.notify,
                self.deferred.reject
            )
            .finally(this.$progress.done)
        ;
    };

    Tree.prototype.$$listenStateChange = function() {
        var self = this;
        this.$rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
            if (toState.name === 'node' &&
                (fromParams.repository !== toParams.repository || fromParams.workspace !== toParams.workspace)
            ) {
                var path = toParams.path === null || toParams.path.length === 0 ? '/' : toParams.path;
                self.$$create({
                    repository: toParams.repository,
                    workspace: toParams.workspace,
                    path: path
                });
            } else if (toState.name === 'node' && self.tree !== null) {
                self.$treeFactory.activate(
                    self.tree.find('/root' + (toParams.path === '/' ? '' : toParams.path))
                );
            }
        });
    }

    Tree.$inject = ['provider', '$q', '$rootScope', '$state', '$treeFactory', '$graph', '$progress'];


    function TreeProvider() {}

    TreeProvider.prototype.$get = ['$injector', function($injector) {
        var promise = $injector
            .instantiate(Tree, {
                provider: this
            })
            .deferred
            .promise
        ;

        var listeners = [];

        promise.then(null, null, function(tree) {
            angular.forEach(listeners, function(listener) {
                listener(tree);
            });
        });

        promise.notified = function(listener) {
            listeners.push(listener);

            return (function(listener) {
                return function() {
                    listeners.splice(listeners.indexOf(listener), 1);
                };
            }(listener));
        };

        return promise;
    }];

    TreeProvider.$inject = [];

    return TreeProvider;
});
