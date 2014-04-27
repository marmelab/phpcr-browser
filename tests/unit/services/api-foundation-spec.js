/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'angularMocks',
  'app',
  'services/api-foundation'
], function () {
  'use strict';

  describe('Service: ApiFoundation', function () {
    var ApiFoundation,
        Config;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function ($injector) {
      ApiFoundation = $injector.get('mbApiFoundation');
      Config = $injector.get('Config');
    }));

    it('should be configured with config.js', function () {
      expect(ApiFoundation.getServer()).toBe(Config.api.server);
      expect(ApiFoundation.getRepositoriesPrefix()).toBe(Config.api.prefixes.repositories);
      expect(ApiFoundation.getWorkspacesPrefix()).toBe(Config.api.prefixes.workspaces);
      expect(ApiFoundation.getNodesPrefix()).toBe(Config.api.prefixes.nodes);
    });
  });
});
