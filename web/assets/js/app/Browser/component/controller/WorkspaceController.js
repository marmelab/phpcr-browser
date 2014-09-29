define([
    'angular'
], function(angular) {
    'use strict';

    function WorkspaceController($scope, $tree, $q, $state, $graph, $treeFactory, $progress, $notification) {
        this.$scope = $scope;
        this.$tree = $tree;
        this.$q = $q;
        this.$state = $state;
        this.$graph = $graph;
        this.$treeFactory = $treeFactory;
        this.$progress = $progress;
        this.$notification = $notification;

        this.$$init();
    }

    WorkspaceController.prototype.$$init = function() {
        var self = this;

        this.cancelTreeListener = this.$tree.notified(function(tree) {
            self.$scope.tree = tree;
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });

        this.$scope.$on('$elementDroppedSuccess', function($event, data) {
            if (!data.draggableData.tree && !data.droppableData.tree) {
                return;
            } else if (!data.draggableData.tree) {
                return self.$notification.error('You can only drop a node here');
            } else if (!data.droppableData.tree) {
                if (data.droppableData.trash) {
                    return self.$$treeRemove(self.$scope.tree.find('/root' + data.draggableData.tree.path));
                }
                return self.$notification.error('You can not drop a node here');
            } else if (data.draggableData.tree.path === data.droppableData.tree.path) {
                return;
            }

            self.$$treeMove(
                self.$scope.tree.find('/root' + data.draggableData.tree.path),
                self.$scope.tree.find('/root' + data.droppableData.tree.path)
            );
        });
    };

    WorkspaceController.prototype.treeClick = function(selectedNode) {
        var deferred = this.$q.defer(),
            self = this
        ;

        this.$progress.start();

        this.$$patchChildren(selectedNode)
            .then(
                function(results) {
                    self.$state
                        .go('node', {
                            repository: self.$state.params.repository,
                            workspace: self.$state.params.workspace,
                            path: selectedNode.path().replace('/root', '')
                        })
                        .then(
                            deferred.resolve,
                            deferred.reject
                        )
                },
                function(err) {
                    self.$progress.done();
                    deferred.reject(err);
                }
            )
            .finally(function() {
                self.$progress.done();
            })
        ;

        return deferred.promise;
    };

    WorkspaceController.prototype.$$patchChildren = function(tree) {
        if (!(tree.data().hasChildren && tree.children().length === 0)) {
            return this.$q.when();
        }

        tree.attr('pending', true);
        var self = this,
            findParams = {
                repository: this.$state.params.repository,
                workspace: this.$state.params.workspace,
                path: tree.path().replace('/root', '')
            }
        ;

        return this.$graph
            .find(findParams)
            .then(function(node) {
                return self.$treeFactory.patchChildren(tree, node.children);
            })
            .then(function() {
                tree.attr('pending', false);
            })
        ;
    };

    WorkspaceController.prototype.$$treeMove = function(treeToMoved, treeDestination) {
        var self = this;

        this.$$patchChildren(treeDestination)
            .then(function() {
                return treeToMoved.moveTo(treeDestination);
            })
            .then(function() {
                treeDestination.attr('hasChildren', true);
                return self.treeClick(treeToMoved);
            })
            .then(function() {
                self.$notification.success('Node moved');
            }, function(err) {
                var message = 'An error occured',
                    type = 'error'
                ;

                if (err.status === 423) {
                    message = 'The resource is locked';
                    type = 'warning';
                } else if (err.data.message) {
                    message = err.data.message;
                }

                self.$notification[type](message);
            })
        ;
    };

    WorkspaceController.prototype.$$treeRemove = function(tree) {
        var self = this;

        tree.remove()
            .then(function() {
                self.$notification.success('Node removed');
            }).then(function() {
                if (tree.path().replace('/root', '') === self.$state.params.path) {
                    return self.$state.go('node', {
                        repository: self.$state.params.repository,
                        workspace: self.$state.params.workspace,
                        path: tree.parent().path().replace('/root', '')
                    });
                }
            }, function(err) {
                var message = 'An error occured',
                    type = 'error'
                ;

                if (err.status === 423) {
                    message = 'The resource is locked';
                    type = 'warning';
                } else if (err.data.message) {
                    message = err.data.message;
                }

                self.$notification[type](message);
            })
        ;
    }

    WorkspaceController.prototype.$$destroy = function() {
        this.cancelTreeListener();

        this.$scope = undefined;
        this.$tree = undefined;
        this.$q = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$treeFactory = undefined;
        this.$progress = undefined;
        this.$notification = undefined;
    };

    WorkspaceController.$inject = ['$scope', '$tree', '$q', '$state', '$graph', '$treeFactory', '$progress', '$notification'];

    return WorkspaceController;
});
