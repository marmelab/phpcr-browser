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
            workspace = {
                restangularizedElement: new Restangular()
            };

            restangular = new Restangular();

            restangular.path = '/test';

            node = new Node(restangular, workspace);
        });

        it('should return the workspace when getWorkspace is called', function() {
            expect(node.getWorkspace()).toBe(workspace);
        });

        it('should call remove on restangularizedElement when remove is called', function() {
            restangular.remove = jasmine.createSpy('remove');

            node.remove();

            expect(restangular.remove).toHaveBeenCalled();
        });
    });
});
