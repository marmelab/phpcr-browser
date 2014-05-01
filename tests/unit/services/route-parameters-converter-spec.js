/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'fixtures',
  'angular',
  'angularMocks',
  'app',
  'services/route-parameters-converter'
], function (mocks) {
  'use strict';

  describe('Service: RouteParametersConverter', function () {
    var RouteParametersConverter,
        ObjectMapper,
        repository,
        workspace,
        $stateParams,
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      ObjectMapper =  mocks.getObjectMapperMock();
      ObjectMapper.find('/test').then(function(r) {
        // We save the repository mock used by ObjectMapper
        repository = r;
        repository.getWorkspace().then(function(w) {
          // We save the workspace mock used the repository
          workspace = w;
        });
      });

      $stateParams = {
        repository: 'test',
        workspace: 'default',
        path: '/node'
      };

      module(function ($provide) {
        $provide.value('mbObjectMapper', ObjectMapper);
        $provide.value('$stateParams', $stateParams);
      });
    });

    beforeEach(inject(function ($injector) {
      RouteParametersConverter = $injector.get('mbRouteParametersConverter');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should call find on ObjectMapper when getCurrentRepository is called', function () {
      RouteParametersConverter.getCurrentRepository();

      expect(ObjectMapper.find).toHaveBeenCalledWith('/test');
    });

    it('should call find on ObjectMapper when getCurrentWorkspace is called', function () {
      RouteParametersConverter.getCurrentWorkspace();
      $rootScope.$apply(); // Force promises resolving
      expect(ObjectMapper.find).toHaveBeenCalledWith('/test');
      expect(repository.getWorkspace).toHaveBeenCalledWith('default');
    });

    it('should call find on ObjectMapper when getCurrentNode is called', function () {
      RouteParametersConverter.getCurrentNode();
      $rootScope.$apply(); // Force promises resolving
      expect(ObjectMapper.find).toHaveBeenCalledWith('/test');
      expect(repository.getWorkspace).toHaveBeenCalledWith('default');
      expect(workspace.getNode).toHaveBeenCalledWith('/node', undefined);
    });
  });
});
