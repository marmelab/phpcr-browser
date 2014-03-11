(function(app) {
  'use strict';

  app.factory('mbWorkspaceFactory', ['$q', function($q) {

    var Workspace = function(workspace, repository, cacheResolver) {
      this._restangular = workspace;
      this._repository = repository;
      this._rootNode = null;
      this._cacheResolver = cacheResolver;
    };

    Workspace.prototype.getName = function() {
      return this._restangular.name;
    };

    Workspace.prototype.getRepository = function() {
      return this._repository;
    };

    Workspace.prototype.getRootNode = function() {
      var deferred = $q.defer(), self = this;
      if (this._rootNode === null) {
        this._cacheResolver(this).then(function(rootNode) {
          self._rootNode = rootNode;
          deferred.resolve(self._rootNode);
        },deferred.reject);
      } else {
        deferred.resolve(this._rootNode);
      }
      return deferred.promise;
    };

    return {
      build: function(workspace, repository, cacheResolver) {
        return new Workspace(workspace, repository, cacheResolver);
      },
      accept: function(data) {
        return data.name !== undefined;
      }
    };
  }]);
})(angular.module('browserApp'));