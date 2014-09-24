/*global describe,it,expect,beforeEach*/
define([
    'app/Graph/component/model/Node',
    'app/Graph/component/model/Workspace',
    'mock/Restangular'
], function(Node, Workspace, Restangular) {
    'use strict';

    describe('Node', function() {
        var restangular,
            workspace,
            node
        ;

        beforeEach(function() {
            workspace = {};

            restangular = new Restangular();

            node = new Node(restangular, workspace);
        });

        it('should return the workspace when getWorkspace is called', function() {
            expect(node.getWorkspace()).toBe(workspace);
        });
    });
});
