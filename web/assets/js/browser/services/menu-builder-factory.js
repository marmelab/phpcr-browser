/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  /**
   * MenuBuilderFactory provides builders for Menu.
   */
  app.service('mbMenuBuilderFactory', ['mbObjectMapper', 'mbRouteParametersConverter', function(ObjectMapper, RouteParametersConverter) {

    var builders = {

      /**
       * Repositories menu link builder
       * @param  {Function} callback
       */
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

      /**
       * Repository menu link builder
       * @param  {Function} callback
       */
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

      /**
       * Workspaces menu link builder
       * @param  {Function} callback
       */
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

    /**
     * Generate a normalized builder object
     * @param  {string} name
     * @return {object}
     */
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
