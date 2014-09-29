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
        this.restangularizedElement = restangularizedElement;
    }

    Node.prototype.getWorkspace = function() {
        return this.workspace;
    };

    Node.prototype.moveTo = function(destination) {
        return this.restangularizedElement.customPUT({
            method: 'move',
            destAbsPath: destination
        });
    };

    Node.prototype.remove = function() {
        return this.restangularizedElement.remove();
    };

    Node.prototype.rename = function(name) {
        return this.restangularizedElement.customPUT({
            method: 'rename',
            newName: name
        });
    };

    return Node;
});
