define(['angular'], function(angular) {
    'use strict';

    function patch(object, method, callback) {
        object[method] = (function(original) {
            return callback(original);
        }(object[method]));
    }

    function FindPatcher($state, $q, $graph) {
        this.$state = $state;
        this.$q = $q;
        this.$graph = $graph;
    }

    FindPatcher.prototype.patch = function(tree, $treeFactory) {
        var self = this;

        patch(tree, 'find', function(find) {
            return function(path) {
                var result = find(path);

                if (result) {
                    result.attr('pending', true);

                    return self.$$loadChildren(result)
                        .then(function() {
                            self.patch(result);
                            return result;
                        })
                        .finally(function() {
                            result.attr('pending', false);
                        })
                    ;
                }

                return self.$$getNode(path, { reducedTree: true, cache: false }).then(function(node) {
                    self.$$merge(tree, node.reducedTree, $treeFactory);
                    var result = find(path);
                    result.attr('collapsed', false); // little hack because we only know here this is a merge
                    return result;
                }, function() {
                    return self.$q.reject();
                });

            };
        });
    };

    FindPatcher.prototype.$$loadChildren = function(tree) {
        if (!tree.attr('hasChildren') || tree.children().length !== 0) {
            return this.$q.when();
        }


        var self = this;

        return this.$$getNode(tree.path()).then(function(node) {
            tree.data().children = [];

            angular.forEach(node.children, function(child) {
                // Do not use the append method to avoid triggering hooks
                child._parent = tree.data();
                tree.data().children.push(child);
            });
        });
    };

    FindPatcher.prototype.$$getNode = function(path, params) {
        path = path.replace('/root', '');

        if (path === '') {
            path = '/';
        }

        var findParams = {
            repository: this.$state.params.repository,
            workspace: this.$state.params.workspace,
            path: path
        };

        return this.$graph.find(findParams, params);
    };

    FindPatcher.prototype.$$merge = function(tree, reducedTree, $treeFactory) {
        var root = reducedTree['/'];
        root.name = 'root';

        reducedTree = $treeFactory({
            children: [root]
        });

        reducedTree = reducedTree.find(tree.path()).data();

        var recursiveMerge = function(tree, reducedTree) {
            if (tree.hasChildren && tree.children.length === 0) {
                tree.children = reducedTree.children.map(function(node) {
                    node._parent = tree;
                    return node;
                });

                return;
            }

            for (var i in tree.children) {
                if (tree.children.hasOwnProperty(i) && reducedTree.children[i]) {
                    recursiveMerge(tree.children[i], reducedTree.children[i], $treeFactory);
                }
            }
        };

        recursiveMerge(tree.data(), reducedTree);
    };

    FindPatcher.$inject = ['$state', '$q', '$graph'];

    return FindPatcher;
});
