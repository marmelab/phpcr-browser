(function(app) {
  'use strict';

  app.service('mbMenu', ['$rootScope', 'mbRouteParametersConverter', 'mbApi',
    function($rootScope, mbRouteParametersConverter, mbApi) {
    var menu = {
      links: [] // Need to be wrapped into an object to keep its reference persistent
    };

    this.getMenu = function() {
      return menu;
    };

    var builders = {
      repositories: function(callback) {
        mbApi.getRepositories().then(function(repositories) {
          var link = {
            label: 'Repositories',
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
        mbRouteParametersConverter.getCurrentRepository().then(function(repository) {
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
        mbRouteParametersConverter.getCurrentWorkspace().then(function(workspace) {
          var link = {
            label: workspace.getName(),
            href: '/' + workspace.getRepository().getName() + '/' + workspace.getName()
          };

          callback(link);
        });
      }],

      node: ['repository', function(callback) {
        mbRouteParametersConverter.getCurrentWorkspace().then(function(workspace) {
          var link = {
            label: workspace.getName(),
            href: '/' + workspace.getRepository().getName() + '/' + workspace.getName()
          };

          callback(link);
        });
      }]
    };

    var runBuilder = function(builder) {
      if (typeof(builder) === 'function') {
        return builder(function(link) {
          menu.links.push(link);
        });
      }
      for (var i=0; i<builder.length; i++) {
        if (i < builder.length-1) {
          runBuilder(builders[builder[i]]);
        } else {
          runBuilder(builder[i]);
        }
      }
    };

    $rootScope.$on('$stateChangeSuccess', function(evt, toState){
      menu.links = [];
      if (builders[toState.name]) {
        runBuilder(builders[toState.name]);
      }
    });
  }]);
})(angular.module('browserApp'));