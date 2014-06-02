/*global define,describe,it,beforeEach,module,inject,expect, spyOn, jasmine*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'controllers/repository'
], function(mocks) {
  'use strict';

  describe('Controller: RepositoryCtrl', function() {
    var RepositoryCtrl,
        $location,
        $log,
        $translate,
        WorkspaceFactory,
        $rootScope,
        $scope,
        workspace;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      $log = $injector.get('$log');
      $location = $injector.get('$location');
      $translate = jasmine.createSpy('$translate').andCallFake($injector.get('$translate'));
      WorkspaceFactory = mocks.getWorkspaceFactoryMock();

      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();

      $scope.repository = mocks.getRepositoryMock();

      workspace = mocks.getWorkspaceMock();

      RepositoryCtrl = $injector.get('$controller')('mbRepositoryCtrl', {
        '$scope': $scope,
        '$location': $location,
        '$log': $log,
        '$translate': $translate,
        'mbWorkspaceFactory': WorkspaceFactory
      });
    }));

    it('should set $scope.displayCreateForm to false', function() {
      expect($scope.displayCreateForm).toBe(false);
    });

    it('should init workspaces list', function() {
      expect($scope.repository.getWorkspaces).toHaveBeenCalled();

      var workspaces;
      $scope.repository.getWorkspaces().then(function(_workspaces) {
        // It is a mixin promise so it is always executed synchronously
        workspaces = _workspaces;
      });

      expect($scope.workspaces).toEqual(workspaces);
    });

    it('should listen for search.change event', function() {
      $rootScope.$broadcast('search.change', 'test');
      expect($scope.search).toBe('test');
    });

    it('should set displayCreateForm to true when showCreateForm is called', function() {
      $scope.displayCreateForm = 'eziofnjksnfsihfzie';
      $scope.showCreateForm();
      expect($scope.displayCreateForm).toBe(true);
    });

    it('should set displayCreateForm to false when hideCreateForm is called', function() {
      $scope.displayCreateForm = 'eziofnjksnfsihfzie';
      $scope.hideCreateForm();
      expect($scope.displayCreateForm).toBe(false);
    });

    it('should call $location.path when openWorkspace is called', function() {
      spyOn($location, 'path');
      $scope.openWorkspace(workspace);
      expect($location.path).toHaveBeenCalledWith('/' + workspace.getRepository().getName() + '/' + workspace.getName());
    });

    it('should not delete a workspace if it is not supported by the repository', function() {
      $scope.repository.setSupports(false);
      $scope.deleteWorkspace({ attr: function() {
        return workspace.getSlug();
      }});

      expect($translate).toHaveBeenCalledWith('WORKSPACE_NOT_SUPPORT_DELETE');
    });

    it('should delete a workspace if supported by the repository', function() {
      var workspaces;
      $scope.repository.getWorkspaces().then(function(_workspaces) {
        // It is a mixin promise so it is always executed synchronously
        workspaces = _workspaces;
      });

      $scope.deleteWorkspace({ attr: function() {
        return workspaces[0].getSlug();
      }});

      expect(workspaces[0].delete).toHaveBeenCalled();
      expect($translate).toHaveBeenCalledWith('WORKSPACE_DELETE_SUCCESS');
    });

    it('should not create a workspace if it is not supported by the repository', function() {
      $scope.repository.setSupports(false);
      $scope.createWorkspace('test');
      expect($translate).toHaveBeenCalledWith('WORKSPACE_NOT_SUPPORT_CREATE');
    });

    it('should create a workspace if supported by the repository', function() {
      $scope.createWorkspace('test');

      expect(WorkspaceFactory.build).toHaveBeenCalledWith({ name: 'test' }, $scope.repository);
      var workspace = mocks.getLastWorkspaceMock();

      expect(workspace.create).toHaveBeenCalled();
      expect($scope.repository.getWorkspaces).toHaveBeenCalledWith({ cache: false });
      expect($translate).toHaveBeenCalledWith('WORKSPACE_CREATE_SUCCESS');
    });
  });
});
