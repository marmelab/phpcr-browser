(function(app) {
  'use strict';

  app.factory('mbWorkspaceFactory', ['mbApiFoundation', function(ApiFoundation) {

    var Workspace = function(workspace, repository, supportedOperations, finder) {
      this._restangular = workspace;
      this._repository = repository;
      this._supportedOperations = supportedOperations;
      this._finder = finder;
    };

    Workspace.prototype.getName = function() {
      return this._restangular.name;
    };

    Workspace.prototype.getRepository = function() {
      return this._repository;
    };

    Workspace.prototype.getNode = function(path) {
      if (!path) { path = '/'; }
      return this._finder('/' + this.getRepository().getName() + '/' + this.getName() + path);
    };

    Workspace.prototype.getSlug = function() {
      return this.getName().replace(' ', '_');
    };

    Workspace.prototype.getSupportedOperations = function() {
      return this._supportedOperations;
    };

    Workspace.prototype.delete = function() {
      return ApiFoundation.deleteWorkspace(this.getRepository().getName(), this.getName());
    };

    return {
      build: function(workspace, repository, supportedOperations, finder) {
        return new Workspace(workspace, repository, supportedOperations, finder);
      },
      accept: function(data) {
        return data.name !== undefined;
      }
    };
  }]);
})(angular.module('browserApp'));