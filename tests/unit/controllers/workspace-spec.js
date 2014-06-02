/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'controllers/workspace'
], function(mocks) {
  'use strict';

  describe('Controller: Workspace', function() {
    var WorkspaceCtrl,
        $log,
        TreeCache,
        $rootScope,
        $scope,
        loaded;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      $log = $injector.get('$log');
      TreeCache = mocks.getTreeCacheMock();
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();

      $scope.currentNode = mocks.getNodeMock();

      loaded = false;
      $rootScope.$on('browser.loaded', function() {
        loaded = true;
      });

      WorkspaceCtrl = $injector.get('$controller')('mbWorkspaceCtrl', {
        '$scope': $scope,
        '$log': $log,
        'mbTreeCache': TreeCache
      });
    }));

    it('should append current repository and current workspace to $scope', function() {
      expect($scope.repository).toBe($scope.currentNode.getWorkspace().getRepository()); // ref equality
      expect($scope.workspace).toBe($scope.currentNode.getWorkspace()); // ref equality
    });

    it('should listen for search.change event', function() {
      $rootScope.$broadcast('search.change', 'test');
      expect($scope.search).toBe('test');
    });

    it('should broadcast drop.delete event when delete is called', function() {
      var element;
      $scope.$on('drop.delete', function(e, el) {
        element = el;
      });
      var target = { name: 'test' };
      $scope.delete(target);
      expect(element).toEqual(target);
    });

    it('should append richTree to $scope', function() {
      expect(TreeCache.getRichTree).toHaveBeenCalled();
      expect($scope.richTree).toEqual({});
      expect(loaded).toBe(true);
    });
  });
});
