/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angularMocks',
  'app',
  'services/tree-cache'
], function (mocks) {
  'use strict';

  describe('Service: TreeCache', function () {
    var TreeCache,
        RichTreeFactory,
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      RichTreeFactory = mocks.getRichTreeFactoryMock();

      module(function ($provide) {
        $provide.value('mbRichTreeFactory', RichTreeFactory);
      });
    });

    beforeEach(inject(function ($injector) {
      TreeCache = $injector.get('mbTreeCache');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should build a RichTree after called build on RichTreeFactory', function () {
      var node = mocks.getNodeMock();
      TreeCache.buildRichTree(node).then(function() {
        expect(RichTreeFactory.build).toHaveBeenCalled();
      }, function() {
        expect(true).toBe(false); // to trigger an error if needed
      });
      $rootScope.$apply();
    });
  });
});
