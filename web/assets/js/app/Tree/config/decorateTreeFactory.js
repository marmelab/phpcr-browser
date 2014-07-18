define([], function () {
    'use strict';

    function decorateTreeFactory($provide) {
        $provide.decorator('$treeFactory', ['$delegate', '$q', function($delegate, $q) {
            var activatedTree = null;

            $delegate.patchChildren = function(tree, children) {
                var promises = [];

                angular.forEach(children, function(child) {
                    promises.push(tree.append($delegate(child)));
                });

                return $q.all(promises);
            };

            $delegate.activate = function(tree) {
                if (activatedTree) {
                    activatedTree.attr('active', false);
                }
                activatedTree = tree;
                tree.attr('active', true);
            };

            return $delegate;
        }]);
    }

    decorateTreeFactory.$inject = ['$provide'];

    return decorateTreeFactory;
});

