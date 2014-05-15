/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/api-foundation',
  'services/repository-factory',
  'services/workspace-factory',
  'services/node-factory'
], function(app, angular) {
  'use strict';

  /**
   * ObjectMapper converts raw data into custom javascript object like Repository, Workspace or Node
   */
  app.service('mbObjectMapper', ['$q', 'mbApiFoundation', 'mbRepositoryFactory','mbWorkspaceFactory','mbNodeFactory',
    function($q, ApiFoundation, RepositoryFactory, WorkspaceFactory, NodeFactory) {
      var self = this;

      /**
       * Find a resource (repository, workspace or node)
       * find('/test') will search for test repository
       * find('/test/default') will search for default workspace in test repository
       * find('/test/default/node') will seach for node with /node as path in the default workspace in test repository
       * find('/') will return all repositories
       * find('/test/*') will return all workspaces in test repository
       * @param  {string} query
       * @param  {object} config
       * @return {promise}
       */
      this.find = function(query, config) {
        if (!query) {
          return ApiFoundation.getRepositories(config).then(function(data) {
            var repositories = [];
            angular.forEach(data, function(repository) {
              if (!RepositoryFactory.accept(repository)) {
                return $q.reject('Invalid response');
              }
              repositories.push(RepositoryFactory.build(repository, self.find));
            });
            return repositories;
          }, function(err) {
            return $q.reject(err);
          });
        }

        if (query.slice(0,1) === '/') {
          query = query.slice(1);
        }
        var components = query.split('/');
        if (components.length === 1) {
          // Repository
          return ApiFoundation.getRepository(components[0], config).then(function(data) {
            if (!RepositoryFactory.accept(data)) {
              return $q.reject('Invalid response');
            }
            return data;
          }).then(function(data) {
            return RepositoryFactory.build(data, self.find);
          }, function(err) {
            return $q.reject(err);
          });

        } else if (components.length === 2) {
          return self.find('/' + components[0]).then(function(repository) {
            if (components[1] === '*') {
              return ApiFoundation.getWorkspaces(components[0], config).then(function(data) {
                var workspaces = [];
                angular.forEach(data, function(workspace) {
                  if (!WorkspaceFactory.accept(workspace)) {
                    return $q.reject('Invalid response');
                  }

                  workspaces.push(WorkspaceFactory.build(workspace, repository, self.find));
                });

                return workspaces;
              }, function(err) {
                return $q.reject(err);
              });
            }

            // Workspace
            return ApiFoundation.getWorkspace(components[0], components[1], config).then(function(data) {
              if (!WorkspaceFactory.accept(data)) {
                return $q.reject('Invalid response');
              }
              return data;
            }).then(function(data) {
              return WorkspaceFactory.build(data, repository, self.find);
            }, function(err) {
              return $q.reject(err);
            });
          }, function(err) {
            return $q.reject(err);
          });

        } else if (components.length > 2) {
          // Node
          var path = '/' + components.slice(2).join('/');
          return ApiFoundation.getNode(components[0], components[1], path, config).then(function(data) {
            if (!NodeFactory.accept(data)) {
              return $q.reject('Invalid response');
            }
            return data;
          }).then(function(data) {
            return self.find('/' + components[0] + '/' + components[1]).then(function(workspace) {
              return NodeFactory.build(data, workspace, self.find);
            }, function(err) {
              return $q.reject(err);
            });
          }, function(err) {
            return $q.reject(err);
          });
        } else {
          return $q.reject('Invalid query');
        }
      };
    }]);
});
