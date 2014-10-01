define([], function() {
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

    FindPatcher.prototype.patch = function(tree) {
        var self = this;

        patch(tree, 'find', function(find) {
            return function(path) {
                var result = find(path);

                if (result) {
                    return self.$$loadChildren(result).then(function() {
                        self.patch(result);
                        return result;
                    })
                }

                return self.$q.reject();
            };
        });
    };

    FindPatcher.prototype.$$loadChildren = function(tree) {
        var path = tree.path().replace('/root', '');

        if (path === '') {
            path = '/';
        }

        if (!tree.attr('hasChildren') || tree.children().length !== 0) {
            return this.$q.when();
        }


        var self = this,
            findParams = {
                repository: this.$state.params.repository,
                workspace: this.$state.params.workspace,
                path: path
            }
        ;

        tree.attr('pending', true);
        return this.$graph
            .find(findParams)
            .then(function(node) {
                tree.data().children = [];

                angular.forEach(node.children, function(child) {
                    // Do not use the append method to avoid triggering hooks
                    child._parent = tree.data();
                    tree.data().children.push(child);
                });
                tree.attr('pending', false);
            })
        ;
    };

    FindPatcher.$inject = ['$state', '$q', '$graph'];

    return FindPatcher;
});
