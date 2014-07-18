define([
    'angular'
], function(angular) {
    'use strict';

    function WorkspaceController($scope, $tree, $q, $state, $graph, $treeFactory, $progress) {
        this.$scope = $scope;
        this.$tree = $tree;
        this.$q = $q;
        this.$state = $state;
        this.$graph = $graph;
        this.$treeFactory = $treeFactory;
        this.$progress = $progress;

        this.$$init();
    }

    WorkspaceController.prototype.$$init = function() {
        var self = this;

        this.cancelTreeListener = this.$tree.notified(function(tree) {
            self.$scope.tree = tree;
        });

        this.$scope.$on('tree.toggle', function() {
            self.displayTree = !self.displayTree;
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });
    };

    WorkspaceController.prototype.treeClick = function(selectedNode) {
        var deferred = this.$q.defer(),
            self = this,
            findParams = {
                repository: this.$state.params.repository,
                workspace: this.$state.params.workspace,
                path: selectedNode.path().replace('/root', '')
            }
        ;

        if (selectedNode.data().hasChildren && selectedNode.children().length === 0) {
            selectedNode.attr('pending', true);
            this.$progress.start();

            this.$graph
                .find(findParams)
                .then(function(node) {
                    return self.$treeFactory.patchChildren(selectedNode, node.children);
                })
                .then(
                    function(results) {
                        self.$state
                            .go('node', findParams)
                            .then(
                                deferred.resolve,
                                deferred.reject
                            )
                            .finally(function() {
                                selectedNode.attr('pending', false);
                            });
                    },
                    deferred.reject
                );
        } else {
            this.$state
                .go('node', findParams)
                .then(
                    deferred.resolve,
                    deferred.reject
                )
            ;
        }

        return deferred.promise;
    };

    WorkspaceController.prototype.$$destroy = function() {
        this.cancelTreeListener();

        this.$scope = undefined;
        this.$tree = undefined;
        this.$q = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$treeFactory = undefined;
        this.$progress = undefined;
    };

    WorkspaceController.$inject = ['$scope', '$tree', '$q', '$state', '$graph', '$treeFactory', '$progress'];

    return WorkspaceController;
});
