/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angularMocks',
  'app',
  'services/event-bridge'
], function (mocks) {
  'use strict';

  describe('Service: EventBridge', function () {
    var EventBridge,
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function ($injector) {
      EventBridge = $injector.get('mbEventBridge');
      $rootScope = $injector.get('$rootScope');

      // For menu building
      $rootScope.currentNode = mocks.getNodeMock();
    }));

    it('should broadcast events', function () {
      var broadcasted = {
        load: false,
        loaded: false,
        workspaceOpenStart: false,
        workspaceOpenSuccess: false,
        nodeOpenStart: false,
        nodeOpenSuccess: false
      };

      var toState = { name: 'workspace' },
          toParams = { repository: 'test', workspace: 'default', path: '/' },
          fromState = { name: 'workspace' },
          fromParams = { repository: 'test', workspace: 'default', path: '/' };


      $rootScope.$on('_browser.load', function() {
        broadcasted.load = true;
      });
      $rootScope.$on('_browser.loaded', function() {
        broadcasted.loaded = true;
      });
      $rootScope.$on('workspace.open.start', function() {
        broadcasted.workspaceOpenStart = true;
      });
      $rootScope.$on('workspace.open.success', function() {
        broadcasted.workspaceOpenSuccess = true;
      });
      $rootScope.$on('node.open.start', function() {
        broadcasted.nodeOpenStart = true;
      });
      $rootScope.$on('node.open.success', function() {
        broadcasted.nodeOpenSuccess = true;
      });

      $rootScope.$broadcast('browser.load');
      expect(broadcasted.load).toBe(true);
      expect(broadcasted.loaded).toBe(false);

      $rootScope.$broadcast('browser.loaded');
      expect(broadcasted.loaded).toBe(true);

      $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
      expect(broadcasted.workspaceOpenStart).toBe(false);
      expect(broadcasted.workspaceOpenSuccess).toBe(false);
      expect(broadcasted.nodeOpenStart).toBe(false);
      expect(broadcasted.nodeOpenSuccess).toBe(false);

      toParams.path = '/node';

      $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
      expect(broadcasted.workspaceOpenStart).toBe(false);
      expect(broadcasted.workspaceOpenSuccess).toBe(false);
      expect(broadcasted.nodeOpenStart).toBe(true);
      expect(broadcasted.nodeOpenSuccess).toBe(false);

      toParams.workspace = 'default2';

      $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
      expect(broadcasted.workspaceOpenStart).toBe(true);
      expect(broadcasted.workspaceOpenSuccess).toBe(false);
      expect(broadcasted.nodeOpenStart).toBe(true);
      expect(broadcasted.nodeOpenSuccess).toBe(false);

      toParams.workspace = 'default';
      toParams.repository = 'test2';

      $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
      expect(broadcasted.workspaceOpenStart).toBe(true);
      expect(broadcasted.workspaceOpenSuccess).toBe(true);
      expect(broadcasted.nodeOpenStart).toBe(true);
      expect(broadcasted.nodeOpenSuccess).toBe(false);

      fromParams.path = '/old';
      toParams.repository = 'test';

      $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
      expect(broadcasted.workspaceOpenStart).toBe(true);
      expect(broadcasted.workspaceOpenSuccess).toBe(true);
      expect(broadcasted.nodeOpenStart).toBe(true);
      expect(broadcasted.nodeOpenSuccess).toBe(true);
    });

  });
});
