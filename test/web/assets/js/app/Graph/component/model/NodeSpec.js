/*global describe,it,expect,beforeEach*/
define([
    'app/Graph/component/model/Node',
    'app/Graph/component/model/Workspace',
    'mock/Restangular'
], function(Node, Workspace, Restangular) {
    'use strict';

    var restangular,
        workspace,
        node
    ;

    beforeEach(function() {
        workspace = {};

        restangular = new Restangular();

        node = new Node(restangular, workspace);
    });

    describe('Node', function() {
        it('should return the workspace when getWorkspace is called', function() {
            expect(node.getWorkspace()).toBe(workspace);
        });
    });
});
