define([
    'angular'
], function (angular) {
    'use strict';

    var $$hashKeyIndex = 0;

    function decorateTreeFactory($provide) {
        $provide.decorator('$treeFactory', ['$delegate', '$q', function($delegate, $q) {
            var activatedTree = null;

            var $originalDelegate = $delegate;
            $delegate = function(data) {
                var tree = $originalDelegate(data);
                // Pre compute $$hashKey to improve rendering speed
                tree.visitor()(function(node) {
                    node.$$hashKey = $$hashKeyIndex++;
                });

                return tree;
            };

            angular.extend($delegate, $originalDelegate);

            $delegate.patchChildren = function(tree, children) {
                var promises = [];

                angular.forEach(children, function(child) {
                    // Do not use the append method to avoid triggering hooks
                    child._parent = tree.data();
                    tree.data().children.push(child);
                });
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

