(function(app) {
  'use strict';

  app.factory('mbRepositoryFactory', ['$q', function($q) {

    var Repository = function(repository, cacheResolver) {
      this._restangular = repository;
      this._workspacesNotCached = true;
      this._workspaces = [];
      this._cacheResolver = cacheResolver;
    };

    Repository.prototype.getName = function() {
      return this._restangular.name;
    };

    Repository.prototype.getFactoryName = function() {
      return this._restangular.factoryName;
    };

    Repository.prototype.getWorkspaces = function() {
      var deferred = $q.defer(), self = this;
      if (this._workspacesNotCached) {
        this._cacheResolver(this).then(function(workspaces) {
          self._workspaces = workspaces;
          self._workspacesNotCached = false;
          deferred.resolve(self._workspaces);
        },deferred.reject);
      } else {
        deferred.resolve(this._workspaces);
      }
      return deferred.promise;
    };

    Repository.prototype.getWorkspace = function(name) {
      var deferred = $q.defer();
      this.getWorkspaces().then(function(workspaces) {
        angular.forEach(workspaces, function(workspace) {
          if (workspace.getName() === name) {
            return deferred.resolve(workspace);
          }
        });
        deferred.reject('Unknown workspace');
      }, deferred.reject);
      return deferred.promise;
    };

    return {
      build: function(repository, cacheResolver) {
        return new Repository(repository, cacheResolver);
      },
      accept: function(data) {
        return data.name !== undefined && data.factoryName !== undefined;
      }
    };
  }]);
})(angular.module('browserApp'));