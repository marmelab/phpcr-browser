/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'fixtures',
  'angular',
  'angularMocks',
  'app',
  'services/workspace-factory'
], function (mocks, fixtures, angular) {
  'use strict';

  describe('Service: WorkspaceFactory', function () {
    var WorkspaceFactory,
        ObjectMapper,
        ApiFoundation,
        $rootScope,
        repository,
        workspaceData = fixtures.workspaces[0];

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      ObjectMapper =  mocks.getObjectMapperMock();
      ApiFoundation = mocks.getApiFoundationMock();
      repository = mocks.getRepositoryMock();

      module(function ($provide) {
        $provide.value('mbObjectMapper', ObjectMapper);
        $provide.value('mbApiFoundation', ApiFoundation);
      });
    });

    beforeEach(inject(function ($injector) {
      WorkspaceFactory = $injector.get('mbWorkspaceFactory');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should accept only valid data', function () {
      expect(WorkspaceFactory.accept(workspaceData)).toBe(true);
      expect(WorkspaceFactory.accept({})).toBe(false);
    });

    it('should return workspace data with getter', function () {
      var workspace = WorkspaceFactory.build(workspaceData, repository, ObjectMapper.find);
      expect(workspace.getName()).toBe(workspaceData.name);
      expect(workspace.getRepository()).toEqual(repository);
      expect(workspace.getSlug()).toBe(workspaceData.name.replace(' ', '_'));

      workspace.getNode('/node', { reducedTree: true });
      expect(ObjectMapper.find).toHaveBeenCalledWith(
        '/' + repository.getName() + '/' + workspaceData.name + '/node',
        { reducedTree: true }
      );
    });

    it('should call createWorkspace on ApiFoundation when create is called', function () {
      var workspace = WorkspaceFactory.build(workspaceData, repository, ObjectMapper.find);
      workspace.delete();
      expect(ApiFoundation.deleteWorkspace).toHaveBeenCalledWith(
        repository.getName(),
        workspaceData.name
      );
    });

    it('should call createWorkspace on ApiFoundation when create is called if name is valid', function () {
      var workspace = WorkspaceFactory.build(workspaceData, repository, ObjectMapper.find);
      workspace.create();
      expect(ApiFoundation.createWorkspace).toHaveBeenCalledWith(
        repository.getName(),
        workspaceData.name
      );

      var wrongWorkspaceData = angular.copy(workspaceData);
      wrongWorkspaceData.name = 'ç!è§_';
      workspace = WorkspaceFactory.build(wrongWorkspaceData, repository, ObjectMapper.find);
      workspace.create().then(angular.noop, function(err) {
        expect(err).not.toBe(undefined);
      });
      $rootScope.$apply();
      expect(ApiFoundation.createWorkspace.calls.length).toBe(1); // No new calls
    });
  });
});
