define([
    'angular'
], function(angular) {
    'use strict';

    function WorkspaceController($scope, $tree, $q, $state, $graph, $treeFactory, $notification) {
        this.$scope = $scope;
        this.$tree = $tree;
        this.$q = $q;
        this.$state = $state;
        this.$graph = $graph;
        this.$treeFactory = $treeFactory;
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

        this.$scope.$on('$elementDropSuccess', function($event, data) {
            if (!data.draggableData.tree && !data.droppableData.tree) {
                return self.$scope.$broadcast('_$elementDropSuccess_', data);
            } else if (!data.draggableData.tree) {
                return self.$notification.error('You can only drop a node here');
            } else if (!data.droppableData.tree) {
                if (data.droppableData.trash) {
                    return self.$scope.tree
                        .find('/root' + data.draggableData.tree.path)
                        .then(function(node) {
                            self.$$treeRemove(node)
                        });
                }
                return self.$notification.error('You can not drop a node here');
            } else if (data.draggableData.tree.path === data.droppableData.tree.path) {
                return;
            }

            self.$q.all([
                self.$scope.tree.find('/root' + data.draggableData.tree.path),
                self.$scope.tree.find('/root' + data.droppableData.tree.path)
            ]).then(function(results) {
                self.$$treeMove(results[0], results[1]);
            })
        });

        this.$scope.$on('$treeCreate', function($event, data) {
            self.$$treeCreate(
                data.parent,
                data.child,
                data.hide
            );
        });
    };

    WorkspaceController.prototype.treeClick = function(selectedNode, cache) {
        var self = this;

        return selectedNode
            .then(function(selectedNode) {
                return self.$state
                    .go('node', {
                        repository: self.$state.params.repository,
                        workspace: self.$state.params.workspace,
                        path: selectedNode.path().replace('/root', '')
                    })
                ;
            })
        ;
    };

    WorkspaceController.prototype.$$treeMove = function(treeToMoved, treeDestination) {
        var self = this
            parent = treeToMoved.parent();
        ;

        treeToMoved.attr('pending', true);
        treeDestination.attr('pending', true);

        treeToMoved
            .moveTo(treeDestination)
            .then(function(treeMoved) {
                self.$treeFactory.walkChildren(treeDestination, function(tree) {
                    tree.attr('path', tree.path().replace('/root', ''));
                });

                parent.attr('hasChildren', parent.data().children.length > 0);
            })
            .then(function() {
                treeDestination.attr('hasChildren', true);
                return self.$$triggerTreeClick(treeDestination);
            })
            .then(function() {
                return self.$$triggerTreeClick(treeToMoved);
            })
            .then(function() {
                self.$notification.success('Node moved');
            }, function(err) {
                self.$notification.errorFromResponse(err);
            })
            .finally(function() {
                treeToMoved.attr('pending', false);
                treeDestination.attr('pending', false);
            })
        ;
    };

    WorkspaceController.prototype.$$treeRemove = function(tree) {
        var self = this;

        tree.remove()
            .then(function() {
                tree.parent().attr('hasChildren', tree.parent().data().children.length > 0);

                if (tree.path().replace('/root', '') === self.$state.params.path) {
                    return self.$$triggerTreeClick(tree.parent(), false);
                }
            }).then(function() {
                self.$notification.success('Node removed');
            }, function(err) {
                self.$notification.errorFromResponse(err);
            })
        ;
    }

    WorkspaceController.prototype.$$treeCreate = function(parent, tree, hideCallback) {
        var self = this;

        parent
            .append(tree)
            .then(function() {
                self.$treeFactory.walkChildren(parent, function(tree) {
                    tree.attr('path', tree.path().replace('/root', ''));
                });

                parent.attr('hasChildren', true);
            })
            .then(function() {
                hideCallback();
                self.$notification.success('Node created');
            })
            .then(function() {
                return self.$$triggerTreeClick(parent);
            }).then(function() {
                return self.$$triggerTreeClick(tree);
            }, function(err) {
                self.$notification.errorFromResponse(err);
            })
        ;
    }

    WorkspaceController.prototype.$$triggerTreeClick = function(tree, cache) {
        return this.treeClick(this.$q.when(tree), cache).then(function() {
            tree.attr('collapsed', false);
        })
    };

    WorkspaceController.prototype.$$destroy = function() {
        this.cancelTreeListener();

        this.$scope = undefined;
        this.$tree = undefined;
        this.$q = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$treeFactory = undefined;
        this.$notification = undefined;
    };

    WorkspaceController.$inject = ['$scope', '$tree', '$q', '$state', '$graph', '$treeFactory', '$notification'];

    return WorkspaceController;
});
