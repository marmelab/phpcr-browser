define([
    'angular'
], function(angular) {
    'use strict';

    function Node(restangularizedElement, workspace) {
        this.workspace = workspace;
        this.$$loadAttributes(restangularizedElement);
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

        this.propertiesCollection = this.workspace.restangularizedElement.all('nodes').all(this.path.slice(1) + '@properties');
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

    Node.prototype.createProperty = function(property) {
        return this.propertiesCollection.customPOST(property);
    };

    Node.prototype.removeProperty = function(propertyName) {
        return this.propertiesCollection.one(propertyName).remove();
    };

    return Node;
});
