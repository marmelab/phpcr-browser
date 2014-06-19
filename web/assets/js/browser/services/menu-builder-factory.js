/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper'
], function(app) {
  'use strict';

  /**
   * MenuBuilderFactory provides builders for Menu.
   */
  app.service('mbMenuBuilderFactory', ['$rootScope', '$translate', 'mbObjectMapper', function($rootScope, $translate, ObjectMapper) {
    var repositoriesLabel = 'MENU_REPOSITORIES';

    var loadLocale = function() {
      $translate('MENU_REPOSITORIES').then(function(translation) {
        repositoriesLabel = translation;
      }, function(err) {
        repositoriesLabel = err;
      });
    };

    loadLocale();
    $rootScope.$on('$translateChangeSuccess',loadLocale);

    var builders = {

      /**
       * Repositories menu link builder
       * @param  {Function} callback
       */
      repositories: function(callback) {
        ObjectMapper.find().then(function(repositories) {
          var link = {
            label: repositoriesLabel,
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
        var repository = $rootScope.repository ? $rootScope.repository : $rootScope.currentNode.getWorkspace().getRepository();
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
      }],

      /**
       * Node menu link builder
       * @param  {Function} callback
       */
      'node': ['repository', function(callback) {
        var workspace = $rootScope.currentNode.getWorkspace();
        var link = {
          label: workspace.getName(),
          href: '/' + workspace.getRepository().getName() + '/' + workspace.getName()
        };

        callback(link);
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
      getNodeBuilder: callbackFactory('node'),
    };
  }]);
});
