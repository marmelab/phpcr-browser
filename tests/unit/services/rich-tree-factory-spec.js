/*global define,describe,it,beforeEach,module,inject,expect, jasmine*/
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
      RichTreeFactory.build(localTreeData, repository).then(function(richTree) {
        richTree.getTree().find('/').then(function(node) {
          expect(node.hasChildren).toBe(true);
        });
        richTree.getTree().find('/child').then(function(node) {
          expect(node.hasChildren).toBe(true);
        });
        richTree.getTree().find('/child/subchild').then(function(node) {
          expect(node.hasChildren).toBe(false);
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });

      $rootScope.$apply();
    });

    it('should add a draggable attribute on each node except for root', function () {
      var localTreeData = angular.copy(treeData);
      RichTreeFactory.build(localTreeData, repository).then(function(richTree) {
        richTree.getTree().find('/').then(function(node) {
          expect(node.draggable).toBeUndefined();
        });
        richTree.getTree().find('/child').then(function(node) {
          expect(node.draggable).toBe(true);
        });
        richTree.getTree().find('/child/subchild').then(function(node) {
          expect(node.draggable).toBe(true);
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });

    it('should add a inProgress attribute between pre and post event', function () {
      var localTreeData = angular.copy(treeData);

      var hooks = [ {
          event: TreeFactory.HOOK_PRE_APPEND,
          callback: jasmine.createSpy('preAppend').andCallFake(function(next, parentPath, childNode, parent) {
            expect(parent.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_POST_APPEND,
          callback: jasmine.createSpy('postAppend').andCallFake(function(next, parentPath, childNode, parent) {
            expect(parent.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_PRE_REMOVE,
          callback: jasmine.createSpy('preRemove').andCallFake(function(next, path, parent) {
            expect(parent.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_POST_REMOVE,
          callback: jasmine.createSpy('postRemove').andCallFake(function(next, path, old, parent) {
            expect(parent.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_PRE_MOVE,
          callback: jasmine.createSpy('preMove').andCallFake(function(next, fromPath, toPath, node) {
            expect(node.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_POST_MOVE,
          callback: jasmine.createSpy('postMove').andCallFake(function(next, fromPath, toPath, node) {
            expect(node.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_PRE_REFRESH,
          callback: jasmine.createSpy('preRefresh').andCallFake(function(next, path, node) {
            expect(node.inProgress).toBe(true);
            next();
          })
        },
        {
          event: TreeFactory.HOOK_POST_REFRESH,
          callback: jasmine.createSpy('postRefresh').andCallFake(function(next, path, node) {
            expect(node.inProgress).toBe(true);
            next();
          })
        }
      ];

      RichTreeFactory.build(localTreeData, repository, hooks).then(function(richTree) {
        richTree.getTree().append('/child', {
          name: 'subchild2',
          children: []
        }).then(function() {
          richTree.getTree().remove('/child/subchild2').finally(function() {
            expect(hooks[2].callback).toHaveBeenCalled();
            expect(hooks[3].callback).toHaveBeenCalled();
          }).then(function() {
            richTree.getTree().move('/child/subchild', '/').finally(function() {
              expect(hooks[4].callback).toHaveBeenCalled();
              expect(hooks[5].callback).toHaveBeenCalled();
            }).then(function() {
              richTree.getTree().refresh('/child', { name: 'subchild2' }).then(function(node) {
                expect(node.inProgress).toBeUndefined();
                expect(hooks[6].callback).toHaveBeenCalled();
                expect(hooks[7].callback).toHaveBeenCalled();
              });
            });
          });
        }).finally(function() {
          expect(hooks[0].callback).toHaveBeenCalled();
          expect(hooks[1].callback).toHaveBeenCalled();
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });
  });
});
