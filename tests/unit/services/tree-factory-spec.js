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
      var tree = TreeFactory.build(localTreeData);
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

      $rootScope.$apply();
    });

    it('should remove a node', function () {
      var localTreeData = angular.copy(treeData);
      var tree = TreeFactory.build(localTreeData);
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
      $rootScope.$apply();
    });

    it('should append a node', function () {
      var localTreeData = angular.copy(treeData);
      var tree = TreeFactory.build(localTreeData);
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

      $rootScope.$apply();
    });

    it('should move a node', function () {
      var localTreeData = angular.copy(treeData);
      var tree = TreeFactory.build(localTreeData);
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

      $rootScope.$apply();
    });

    it('should call hooks', function () {
      var localTreeData = angular.copy(treeData);

      var hooks = [
        {
          event: TreeFactory.HOOK_POST_REMOVE,
          callback: jasmine.createSpy('remove')
        },
        {
          event: TreeFactory.HOOK_POST_MOVE,
          callback: jasmine.createSpy('move')
        },
        {
          event: TreeFactory.HOOK_POST_APPEND,
          callback: jasmine.createSpy('append')
        }
      ];

      var tree = TreeFactory.build(localTreeData, hooks);

      tree.append('/child', {
        name: 'subchild2',
        children: []
      }).then(function(node) {
        expect(hooks[2].callback).toHaveBeenCalledWith('/child', node, localTreeData.children[0]);
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });

      tree.move('/child/subchild', '/').then(function(node) {
        expect(hooks[1].callback).toHaveBeenCalledWith('/child/subchild', '/', node);
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });

      tree.remove('/child/subchild2').then(function(node) {
        expect(hooks[0].callback).toHaveBeenCalledWith('/child/subchild2', node);
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });

      $rootScope.$apply();
    });
  });
});
