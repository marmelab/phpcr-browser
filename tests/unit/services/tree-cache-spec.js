/*global define,describe,it,beforeEach,module,inject,expect,jasmine*/
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
        RouteParametersConverter,
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      RichTreeFactory = mocks.getRichTreeFactoryMock();
      RouteParametersConverter = mocks.getRouteParametersConverterMock();

      module(function ($provide) {
        $provide.value('mbRichTreeFactory', RichTreeFactory);
        $provide.value('mbRouteParametersConverter', RouteParametersConverter);
      });
    });

    beforeEach(inject(function ($injector) {
      TreeCache = $injector.get('mbTreeCache');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should return a RichTree after called getCurrentNode on RouteParametersConverter', function () {
      TreeCache.getRichTree().then(function(richTree) {
        expect(richTree).toEqual({ getRawTree: jasmine.any(Function) });
        expect(RouteParametersConverter.getCurrentNode).toHaveBeenCalled();
      });
      $rootScope.$apply();
    });
  });
});
