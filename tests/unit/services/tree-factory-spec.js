/*global define,describe,it,beforeEach,module,inject,expect, jasmine*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'services/tree-factory'
], function () {
  'use strict';

  describe('Service: TreeFactory', function () {
    var TreeFactory,
        $rootScope,
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

    beforeEach(inject(function ($injector) {
      TreeFactory = $injector.get('mbTreeFactory');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should find a node', function () {
      var localTreeData = angular.copy(treeData);
      TreeFactory.build(localTreeData).then(function(tree) {
        tree.find('/').then(function(node) {
          expect(node).toEqual(treeData);
        });

        tree.find('/child').then(function(node) {
          expect(node).toEqual(treeData.children[0]);
        });

        tree.find('/child/subchild').then(function(node) {
          expect(node).toEqual(treeData.children[0].children[0]);
        });

        tree.find('/unknown').then(angular.noop, function(err) {
          expect(err).toBe('Unknown node');
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });

      $rootScope.$apply();
    });

    it('should remove a node', function () {
      var localTreeData = angular.copy(treeData);
      TreeFactory.build(localTreeData).then(function(tree) {
        tree.remove('/child').then(function(node) {
          expect(node).toEqual({
            name: 'child',
            path: '/child',
            children: [ { name: 'subchild',
                          path: '/child/subchild',
                          children: []
                        }
                      ]
          });

          tree.find('/child').then(angular.noop, function(err) {
            expect(err).toBe('Unknown node');
          });
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });

    it('should append a node', function () {
      var localTreeData = angular.copy(treeData);
      TreeFactory.build(localTreeData).then(function(tree) {
        tree.append('/child', {
          name: 'subchild2',
          children: []
        }).then(function(node) {
          expect(node).toEqual({
            name: 'subchild2',
            path: '/child/subchild2',
            children: []
          });

          tree.find('/child/subchild2').then(function(node) {
            expect(node).toEqual({
              name: 'subchild2',
              path: '/child/subchild2',
              children: []
            });
          }, function() {
            expect(true).toBe(false); // to trigger an error if needed
          });
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });

    it('should move a node', function () {
      var localTreeData = angular.copy(treeData);
      TreeFactory.build(localTreeData).then(function(tree) {
        tree.move('/child/subchild', '/').then(function(node) {
          expect(node).toEqual({
            name: 'subchild',
            path: '/subchild',
            children: []
          });

          tree.find('/subchild').then(function(node) {
            expect(node).toEqual({
              name: 'subchild',
              path: '/subchild',
              children: []
            });
          }, function() {
            expect(true).toBe(false); // to trigger an error if needed
          });

          tree.find('/child/subchild').then(angular.noop, function(err) {
            expect(err).toBe('Unknown node'); // to trigger an error if needed
          });
        }, function() {
          expect(true).toBe(false); // to trigger an error if needed
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });

    it('should refresh a node', function () {
      var localTreeData = angular.copy(treeData);
      TreeFactory.build(localTreeData).then(function(tree) {
        tree.refresh('/child/subchild', { name: 'subchild2' }).then(function(node) {
          expect(node).toEqual({
            name: 'subchild2',
            path: '/child/subchild',
            children: []
          });
        }, function() {
          expect(true).toBe(false); // to trigger an error if needed
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });

    it('should call hooks', function () {
      var localTreeData = angular.copy(treeData);

      var hooks = [
        {
          event: TreeFactory.HOOK_PRE_REMOVE,
          callback: jasmine.createSpy('preRemove')
        },
        {
          event: TreeFactory.HOOK_POST_REMOVE,
          callback: jasmine.createSpy('postRemove')
        },
        {
          event: TreeFactory.HOOK_PRE_MOVE,
          callback: jasmine.createSpy('preMove')
        },
        {
          event: TreeFactory.HOOK_POST_MOVE,
          callback: jasmine.createSpy('postMove')
        },
        {
          event: TreeFactory.HOOK_PRE_APPEND,
          callback: jasmine.createSpy('preAppend')
        },
        {
          event: TreeFactory.HOOK_POST_APPEND,
          callback: jasmine.createSpy('postAppend')
        },
        {
          event: TreeFactory.HOOK_POST_APPEND,
          callback: jasmine.createSpy('postAppendNeverCalled')
        },
        {
          event: TreeFactory.HOOK_PRE_REFRESH,
          callback: jasmine.createSpy('preRefresh')
        },
        {
          event: TreeFactory.HOOK_POST_REFRESH,
          callback: jasmine.createSpy('postRefresh').andCallFake(function(next) {
            next();
          })
        },
        {
          event: TreeFactory.HOOK_POST_REFRESH,
          callback: jasmine.createSpy('postRefresh2')
        }
      ];

      TreeFactory.build(localTreeData, hooks).then(function(tree) {
        tree.append('/child', {
          name: 'subchild2',
          children: []
        }).then(function(node) {
          expect(hooks[4].callback).toHaveBeenCalledWith(jasmine.any(Function), '/child', node, localTreeData.children[0]);
          expect(hooks[5].callback).toHaveBeenCalledWith(jasmine.any(Function), '/child', node, localTreeData.children[0]);
          expect(hooks[6].callback).not.toHaveBeenCalled();
          tree.remove('/child/subchild2').then(function(node) {
            expect(hooks[0].callback).toHaveBeenCalledWith(jasmine.any(Function), '/child/subchild2', localTreeData.children[0]);
            expect(hooks[1].callback).toHaveBeenCalledWith(jasmine.any(Function), '/child/subchild2', node, localTreeData.children[0]);
          }, function() {
            expect(true).toBe(false); // to trigger an error if needed
          });

        }, function() {
          expect(true).toBe(false); // to trigger an error if needed
        });

        tree.move('/child/subchild', '/').then(function(node) {
          expect(hooks[2].callback).toHaveBeenCalledWith(jasmine.any(Function), '/child/subchild', '/', treeData.children[0].children[0]);
          expect(hooks[3].callback).toHaveBeenCalledWith(jasmine.any(Function), '/child/subchild', '/', node);

          tree.refresh('/subchild', { name: 'subchild2' }).then(function(node) {
            expect(hooks[7].callback).toHaveBeenCalledWith(jasmine.any(Function), '/subchild', node, { name: 'subchild2' });
            expect(hooks[8].callback).toHaveBeenCalledWith(jasmine.any(Function), '/subchild', node, { name: 'subchild2' });
            expect(hooks[9].callback).toHaveBeenCalledWith(jasmine.any(Function), '/subchild', node, { name: 'subchild2' });
          }, function() {
            expect(true).toBe(false); // to trigger an error if needed
          });

        }, function() {
          expect(true).toBe(false); // to trigger an error if needed
        });
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });

      $rootScope.$apply();
    });
  });
});
