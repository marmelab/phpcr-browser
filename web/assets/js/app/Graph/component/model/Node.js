define([
    'angular'
], function(angular) {
    'use strict';

    function Node(restangularizedElement, workspace) {
        this.$$loadAttributes(restangularizedElement);

        this.workspace = workspace;
        this.restangularizedElement = restangularizedElement;
    }

    Node.prototype.$$loadAttributes = function(container) {
        this.path = container.path;
        this.name = container.name;
        this.children = container.children;
        this.hasChildren = container.hasChildren;
        this.properties = container.properties;

        if (container.reducedTree) {
            this.reducedTree = container.reducedTree;
        }
    };

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
        var self = this;
        return this.restangularizedElement.customPUT({
            method: 'rename',
            newName: name
        }).then(function(response) {
            self.name = name;
            return response;
        });
    };

    Node.prototype.create = function(name) {
        var self = this;

        return this.restangularizedElement
            .customPOST({
                relPath: name
            })
            .then(function() {
                return self.restangularizedElement.get();
            })
            .then(function(node) {
                self.$$loadAttributes(node);
            })
        ;
    };

    return Node;
});
