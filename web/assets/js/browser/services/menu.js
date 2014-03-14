(function(app) {
  'use strict';

  app.service('mbMenu', ['$rootScope', 'mbRouteParametersConverter', 'mbObjectMapper',
    function($rootScope, RouteParametersConverter, ObjectMapper) {
    var menu = {
      repositories: null,
      repository: null,
      workspace: null
    };

    var resetMenu = function() {
      menu.repositories = null;
      menu.repository = null;
      menu.workspace = null;
    };

    resetMenu();

    this.getMenu = function() {
      return menu;
    };

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

    var runBuilder = function(name, builder) {
      if (typeof(builder) === 'function') {
        return builder(function(link) {
          menu[name] = link;
        });
      }

      for (var i=0; i<builder.length; i++) {
        if (i < builder.length-1) {
          runBuilder(builder[i], builders[builder[i]]);
        } else {
          runBuilder(name, builder[i]);
        }
      }
    };

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === fromState.name &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace ) { return; }

      resetMenu();
      if (builders[toState.name]) {
        runBuilder(toState.name, builders[toState.name]);
      }
    });
  }]);
})(angular.module('browserApp'));