define([
    'angular'
], function(angular) {
    'use strict';

    function Node(restangularizedElement, workspace) {
        this.path = restangularizedElement.path;
        this.name = restangularizedElement.name;
        this.children = restangularizedElement.children;
        this.hasChildren = restangularizedElement.hasChildren;
        this.properties = restangularizedElement.properties;

        if (restangularizedElement.reducedTree) {
            this.reducedTree = restangularizedElement.reducedTree;
        }

        this.workspace = workspace;
    }

    Node.prototype.getWorkspace = function() {
        return this.workspace;
    };

    return Node;
});
