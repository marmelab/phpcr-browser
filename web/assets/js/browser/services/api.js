(function(angular, app) {
  'use strict';

  app.service('mbApi', ['$q', 'mbApiFoundation','mbRepositoryFactory','mbWorkspaceFactory','mbNodeFactory',
    function($q, mbApiFoundation, mbRepositoryFactory, mbWorkspaceFactory, mbNodeFactory) {
      var _repositories;

      var nodeCacheResolver = function(node) {
        var deferred = $q.defer();
        mbApiFoundation.getNode(node.getWorkspace().getRepository().getName(), node.getWorkspace.getName(), node.getPath())
        .then(function(data) {
          if (!mbNodeFactory.accept(data.node)) { return deferred.reject('Invalid response'); }
          deferred.resolve(data.node.children);
        }, deferred.reject);
        return deferred.promise;
      };

      var rootNodeCacheResolver = function(workspace) {
        var deferred = $q.defer();
        mbApiFoundation.getNode(workspace.getRepository().getName(), workspace.getName(), '/')
        .then(function(data) {
          if (!mbNodeFactory.accept(data.node)) { return deferred.reject('Invalid response'); }
          deferred.resolve(mbNodeFactory.build(data.node, workspace, nodeCacheResolver));
        }, deferred.reject);
        return deferred.promise;
      };

      var workspaceCacheResolver = function(repository) {
        var deferred = $q.defer(), workspaces = [];
        mbApiFoundation.getWorkspaces(repository.getName()).then(function(data) {
          angular.forEach(data.workspaces, function(workspace) {
            if (!mbWorkspaceFactory.accept(workspace)) { return deferred.reject('Invalid response'); }
            workspaces.push(mbWorkspaceFactory.build(workspace, repository, rootNodeCacheResolver));
          });
          deferred.resolve(workspaces);
        }, deferred.reject);
        return deferred.promise;
      };

      this.getNode = function(workspace, path) {
        var deferred = $q.defer();
        mbApiFoundation.getNode(workspace.getRepository().getName(), workspace.getName(), path).then(function(data) {
          if (!mbNodeFactory.accept(data.node)) { return deferred.reject('Invalid response'); }
          deferred.resolve(mbNodeFactory.build(data.node, workspace, nodeCacheResolver));
        }, deferred.reject);
        return deferred.promise;
      };

      this.getRepository = function(name) {
        var deferred = $q.defer(), resolved = false;
        if (_repositories.length !== undefined) {
          angular.forEach(_repositories, function(repository) {
            if (repository.getName() === name) { resolved = true; return deferred.resolve(repository); }
          });
        }

        if (!resolved) {
          mbApiFoundation.getRepository(name).then(function(data) {
            if (!mbRepositoryFactory.accept(data.repository)) { return deferred.reject('Invalid response'); }
            deferred.resolve(mbRepositoryFactory.build(data.repository, workspaceCacheResolver));
          }, deferred.reject);
        }
        return deferred.promise;
      };

      this.getRepositories = function() {
        var deferred = $q.defer();
        if (!_repositories) {
          var repositories = [];
          mbApiFoundation.getRepositories().then(function(data) {
            angular.forEach(data.repositories, function(repository) {
              if (!mbRepositoryFactory.accept(repository)) { return deferred.reject('Invalid response'); }
              repositories.push(mbRepositoryFactory.build(repository, workspaceCacheResolver));
            });
            deferred.resolve(repositories);
            _repositories = repositories;
          }, deferred.reject);
        } else { deferred.resolve(_repositories); }
        return deferred.promise;
      };
    }]);
})(angular, angular.module('browserApp'));