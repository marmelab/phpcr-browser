define('mock/TreeFactory', [
    'mixin'
], function(mixin) {
    'use strict';

    var nodeFactory = function() {
        return {
            find: function() {
                return mixin.buildPromise(nodeFactory());
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

    TreeFactory.walkChildren = function() {}

    return TreeFactory;
});
