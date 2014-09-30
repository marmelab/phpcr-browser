define('mock/TreeFactory', [], function() {
    'use strict';

    var nodeFactory = function() {
        return {
            find: function() {
                return nodeFactory();
            },

            toggle: function() {

            },

            parent: function() {
                return undefined;
            },

            registerListener: function() {

            },

            attr: function() {

            }
        }
    };

    function TreeFactory() {
        return nodeFactory();
    }

    TreeFactory.activate = function(o) {
        o.active = true;
    }

    TreeFactory.patchChildren = function() {}

    return TreeFactory;
});
