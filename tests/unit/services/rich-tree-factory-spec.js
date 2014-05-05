/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angularMocks',
  'app',
  'services/rich-tree-factory'
], function (mocks) {
  'use strict';

  describe('Service: RichTreeFactory', function () {
    var RichTreeFactory,
        TreeFactory,
        $rootScope,
        repository,
        treeData = { name: 'root',
          path: '/',
          children: [ { name: 'child',
                        path: '/child',
                        children: [ { name: 'subchild',
                                      path: '/child/subchild',
                                      children: []
                                    }
                                  ]
                      }
                    ]
        };

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      repository = mocks.getRepositoryMock();
    });

    beforeEach(inject(function ($injector) {
      RichTreeFactory = $injector.get('mbRichTreeFactory');
      TreeFactory = $injector.get('mbTreeFactory');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should add a hasChildren attribute on each node', function () {
      var localTreeData = angular.copy(treeData);
      var richTree = RichTreeFactory.build(localTreeData, repository);
      richTree.getTree().find('/').then(function(node) {
        expect(node.hasChildren).toBe(true);
      });
      richTree.getTree().find('/child').then(function(node) {
        expect(node.hasChildren).toBe(true);
      });
      richTree.getTree().find('/child/subchild').then(function(node) {
        expect(node.hasChildren).toBe(false);
      });
      $rootScope.$apply();
    });

    it('should add a draggable attribute on each node except for root', function () {
      var localTreeData = angular.copy(treeData);
      var richTree = RichTreeFactory.build(localTreeData, repository);
      richTree.getTree().find('/').then(function(node) {
        expect(node.draggable).toBeUndefined();
      });
      richTree.getTree().find('/child').then(function(node) {
        expect(node.draggable).toBe(true);
      });
      richTree.getTree().find('/child/subchild').then(function(node) {
        expect(node.draggable).toBe(true);
      });
      $rootScope.$apply();
    });

    it('should add a inProgress attribute between pre and post event', function () {
      var localTreeData = angular.copy(treeData);
      var richTree = RichTreeFactory.build(localTreeData, repository, [
        {
          event: TreeFactory.HOOK_PRE_APPEND,
          callback: function(parentPath, childNode, parent) {
            expect(parent.inProgress).toBe(true);
          }
        },
        {
          event: TreeFactory.HOOK_POST_APPEND,
          callback: function(parentPath, childNode, parent) {
            expect(parent.inProgress).toBeUndefined();
          }
        },
        {
          event: TreeFactory.HOOK_PRE_REMOVE,
          callback: function(path, parent) {
            expect(parent.inProgress).toBe(true);
          }
        },
        {
          event: TreeFactory.HOOK_POST_REMOVE,
          callback: function(path, old, parent) {
            expect(parent.inProgress).toBeUndefined();
          }
        },
        {
          event: TreeFactory.HOOK_PRE_MOVE,
          callback: function(fromPath, toPath, node) {
            expect(node.inProgress).toBe(true);
          }
        },
        {
          event: TreeFactory.HOOK_POST_MOVE,
          callback: function(fromPath, toPath, node) {
            expect(node.inProgress).toBeUndefined();
          }
        }
      ]);

      richTree.getTree().append('/child', {
        name: 'subchild2',
        children: []
      });

      richTree.getTree().remove('/child/subchild2');
      richTree.getTree().move('/child/subchild', '/');
      $rootScope.$apply();
    });
  });
});
