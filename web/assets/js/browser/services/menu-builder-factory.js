/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.service('mbMenuBuilderFactory', ['mbObjectMapper', 'mbRouteParametersConverter', function(ObjectMapper, RouteParametersConverter) {

    var builders = {
      repositories: function(callback) {
        ObjectMapper.find().then(function(repositories) {
          var link = {
            label: 'Repositories',
            class: 'dropdown',
            sublinks: []
          };
          angular.forEach(repositories, function(repository) {
            link.sublinks.push({
              label: repository.getName(),
              href: '/' + repository.getName()
            });
          });
          callback(link);
        });
      },

      repository: ['repositories', function(callback) {
        RouteParametersConverter.getCurrentRepository().then(function(repository) {
          repository.getWorkspaces().then(function(workspaces) {
            var link = {
              label: repository.getName(),
              sublinks: []
            };

            angular.forEach(workspaces, function(workspace) {
              link.sublinks.push({
                label: workspace.getName(),
                href: '/' + repository.getName() + '/' + workspace.getName()
              });
            });

            callback(link);
          });
        });
      }],

      workspace: ['repository', function(callback) {
        RouteParametersConverter.getCurrentWorkspace().then(function(workspace) {
          var link = {
            label: workspace.getName(),
            href: '/' + workspace.getRepository().getName() + '/' + workspace.getName()
          };

          callback(link);
        });
      }]
    };

    var callbackFactory = function(name) {
      return function() {
        return {
          name: name,
          builder: builders[name]
        };
      };
    };
    return {
      getRepositoriesBuilder: callbackFactory('repositories'),
      getRepositoryBuilder: callbackFactory('repository'),
      getWorkspaceBuilder: callbackFactory('workspace'),
    };
  }]);
});
