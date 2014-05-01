/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'services/object-mapper'
], function (mocks) {
  'use strict';

  describe('Service: Menu', function () {
    var ObjectMapper,
        ApiFoundation,
        RepositoryFactory,
        WorkspaceFactory,
        NodeFactory,
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      ApiFoundation =  mocks.getApiFoundationMock();
      RepositoryFactory = mocks.getRepositoryFactoryMock();
      WorkspaceFactory = mocks.getWorkspaceFactoryMock();
      NodeFactory = mocks.getNodeFactoryMock();

      module(function ($provide) {
        $provide.value('mbApiFoundation', ApiFoundation);
        $provide.value('mbRepositoryFactory', RepositoryFactory);
        $provide.value('mbWorkspaceFactory', WorkspaceFactory);
        $provide.value('mbNodeFactory', NodeFactory);
      });
    });

    beforeEach(inject(function ($injector) {
      ObjectMapper = $injector.get('mbObjectMapper');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should return repositories if queried', function () {
      ObjectMapper.find();

      expect(ApiFoundation.getRepositories).toHaveBeenCalled();

      expect(RepositoryFactory.build).toHaveBeenCalled();
    });

    it('should return a repository if queried', function () {
      ObjectMapper.find('/test');

      expect(ApiFoundation.getRepository).toHaveBeenCalledWith(
        'test',
        undefined
      );

      expect(RepositoryFactory.build).toHaveBeenCalled();
    });

    it('should return a workspace if queried', function () {
      ObjectMapper.find('/test/default');
      $rootScope.$apply();

      expect(ApiFoundation.getRepository).toHaveBeenCalledWith(
        'test',
        undefined
      );

      expect(ApiFoundation.getWorkspace).toHaveBeenCalledWith(
        'test',
        'default',
        undefined
      );
      expect(WorkspaceFactory.build).toHaveBeenCalled();
    });

    it('should return a node if queried', function () {
      ObjectMapper.find('/test/default/parent/node');
      $rootScope.$apply();

      expect(ApiFoundation.getRepository).toHaveBeenCalledWith(
        'test',
        undefined
      );

      expect(ApiFoundation.getWorkspace).toHaveBeenCalledWith(
        'test',
        'default',
        undefined
      );

      expect(ApiFoundation.getNode).toHaveBeenCalledWith(
        'test',
        'default',
        '/parent/node',
        undefined
      );

      expect(NodeFactory.build).toHaveBeenCalled();
    });
  });
});
