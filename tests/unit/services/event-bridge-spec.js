/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'angularMocks',
  'app',
  'services/event-bridge'
], function () {
  'use strict';

  describe('Service: EventBridge', function () {
    var EventBridge,
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function ($injector) {
      EventBridge = $injector.get('mbEventBridge');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should broadcast events', function () {
      var broadcasted = {
        load: false,
        loaded: false
      };

      $rootScope.$on('_browser.load', function() {
        broadcasted.load = true;
      });
      $rootScope.$on('_browser.loaded', function() {
        broadcasted.loaded = true;
      });

      $rootScope.$broadcast('browser.load');
      expect(broadcasted.load).toBe(true);
      expect(broadcasted.loaded).toBe(false);

      $rootScope.$broadcast('browser.loaded');
      expect(broadcasted.loaded).toBe(true);
    });

  });
});
