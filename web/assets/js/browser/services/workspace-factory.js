(function(app) {
  'use strict';

  app.factory('mbWorkspaceFactory', function() {

    var Workspace = function(workspace, repository, finder) {
      this._restangular = workspace;
      this._repository = repository;
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

    return {
      build: function(workspace, repository, finder) {
        return new Workspace(workspace, repository, finder);
      },
      accept: function(data) {
        return data.name !== undefined;
      }
    };
  });
})(angular.module('browserApp'));