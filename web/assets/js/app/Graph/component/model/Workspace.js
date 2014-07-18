define([
    'app/Graph/component/model/Node'
], function(Node) {
    'use strict';

    function Workspace(restangularizedElement, repository) {
        this.name = restangularizedElement.name;
        this.supportedOperations = restangularizedElement.supportedOperations;

        this.repository = repository;
        this.nodesCollection = restangularizedElement.all('nodes');
    }

    Workspace.prototype.getNodes = function() {
        var self = this;
        return this.nodesCollection
            .getList()
            then(function(nodes) {
                return nodes.map(function(node) {
                    return new Node(node, self);
                });
            });
    };

    Workspace.prototype.getNode = function(path, reducedTree) {
        var self = this,
            params = reducedTree ? { reducedTree: 'true' } : {}
        ;

        return this.nodesCollection
            .one(path.slice(1))
            .get(params)
            .then(function(node) {
                return new Node(node, self);
            });
    };

    Workspace.prototype.getRepository = function() {
        return this.repository;
    };

    return Workspace;
});
