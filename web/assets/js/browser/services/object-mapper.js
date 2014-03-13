(function(angular, app) {
  'use strict';

  app.service('mbObjectMapper', ['$q', 'mbApiFoundation', 'mbRepositoryFactory','mbWorkspaceFactory','mbNodeFactory',
    function($q, ApiFoundation, RepositoryFactory, WorkspaceFactory, NodeFactory) {
      var self = this;
      this.find = function(query) {
        var deferred = $q.defer();
        if (!query) {
          ApiFoundation.getRepositories().then(function(data) {
            var repositories = [];
            angular.forEach(data.repositories, function(repository) {
              if (!RepositoryFactory.accept(repository)) { return deferred.reject('Invalid response'); }
              repositories.push(RepositoryFactory.build(repository));
            });
            deferred.resolve(repositories);
          }, deferred.reject);
          return deferred.promise;
        }

        if (query.slice(0,1) === '/') {
          query = query.slice(1);
        }
        var components = query.split('/');
        if (components.length === 1) {
          // Repository
          ApiFoundation.getRepository(components[0]).then(function(data) {
            if (!RepositoryFactory.accept(data.repository)) { return deferred.reject('Invalid response'); }
            deferred.resolve(RepositoryFactory.build(data.repository, self.find));
          }, deferred.reject);
        } else if (components.length === 2) {
          self.find('/' + components[0]).then(function(repository) {
            if (components[1] === '*') {
              ApiFoundation.getWorkspaces(components[0]).then(function(data) {
                var workspaces = [];
                angular.forEach(data.workspaces, function(workspace) {
                  if (!WorkspaceFactory.accept(workspace)) { return deferred.reject('Invalid response'); }
                  workspaces.push(WorkspaceFactory.build(workspace, repository, self.find));
                });
                deferred.resolve(workspaces);
              }, deferred.reject);
            } else {
              // Workspace
              ApiFoundation.getWorkspace(components[0], components[1]).then(function(data) {
                if (!WorkspaceFactory.accept(data.workspace)) { return deferred.reject('Invalid response'); }
                deferred.resolve(WorkspaceFactory.build(data.workspace, repository, self.find));
              }, deferred.reject);
            }
          }, deferred.reject);
        } else if (components.length > 2) {
          // Node
          var path = '/' + components.slice(2).join('/');
          ApiFoundation.getNode(components[0], components[1], path).then(function(data) {
            self.find('/' + components[0] + '/' + components[1]).then(function(workspace) {
              if (!NodeFactory.accept(data.node)) { return deferred.reject('Invalid response'); }
              deferred.resolve(NodeFactory.build(data.node, workspace, self.find));
            }, deferred.reject);
          }, deferred.reject);
        } else {
          deferred.reject('Invalid query');
        }
        return deferred.promise;
      };
    }]);
})(angular, angular.module('browserApp'));