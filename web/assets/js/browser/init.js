/* global define */
/* jshint indent:2 */

define([
  'angular',
  'app',
  'locales/en_EN',
  'locales/fr_FR',
  'config',
  'controllers/navbar',
  'controllers/properties',
  'controllers/repositories',
  'controllers/repository',
  'controllers/workspace',
  'directives/ui/overlay',
  'directives/ui/dropper',
  'directives/draggable',
  'directives/droppable',
  'directives/focus-me',
  'services/event-bridge',
  'services/api-foundation',
  'services/menu',
  'services/menu-builder-factory'
], function(angular, app, localeEN, localeFR) {
  'use strict';

  var firstLoad = true;

  app.value('$anchorScroll', angular.noop)
  .config(function($stateProvider, $urlRouterProvider, $translateProvider, RestangularProvider, mbApiFoundationProvider, mbConfig){
    mbApiFoundationProvider.setServer(mbConfig.api.server);
    mbApiFoundationProvider.setRepositoriesPrefix(mbConfig.api.prefixes.repositories);
    mbApiFoundationProvider.setWorkspacesPrefix(mbConfig.api.prefixes.workspaces);
    mbApiFoundationProvider.setNodesPrefix(mbConfig.api.prefixes.nodes);

    mbApiFoundationProvider.setErrorHandler(function(err, $log, $translate) {
      if (err.status === 423) { return $translate('RESOURCE_LOCKED').then($log.warn, $log.warn); }
      else if (err.data && err.data.message) { return $log.error(err, err.data.message); }
      $log.error(err);
    });

    RestangularProvider.setDefaultHttpFields({cache: true});
    $urlRouterProvider
      .when('', '/')
      .otherwise('/');

    $stateProvider
      .state('repositories', {
        url:'/',
        resolve: {
          repositories: ['$rootScope', '$q', 'mbObjectMapper', function($rootScope, $q, ObjectMapper) {
            $rootScope.$emit('browser.load');
            return ObjectMapper.find().then(function(repositories) {
              $rootScope.$emit('browser.loaded');
              $rootScope.repositories = repositories;
              return repositories;
            }, function(err) {
              return $q.reject(err);
            });
          }]
        },
        templateUrl: '/assets/js/browser/views/repositories.html',
        controller: 'mbRepositoriesCtrl'
      })
      .state('repository', {
        url: '/:repository',
        resolve: {
          repository: ['$rootScope', '$q', '$stateParams', 'mbObjectMapper', function($rootScope, $q, $stateParams, ObjectMapper) {
            $rootScope.$emit('browser.load');
            return ObjectMapper.find('/' + $stateParams.repository).then(function(repository) {
              $rootScope.$emit('browser.loaded');
              $rootScope.repository = repository;
              return repository;
            }, function(err) {
              return $q.reject(err);
            });
          }]
        },
        templateUrl: '/assets/js/browser/views/repository.html',
        controller : 'mbRepositoryCtrl'
      })
      .state('workspace', {
        url: '/:repository/:workspace',
        templateUrl: '/assets/js/browser/views/workspace.html',
        abstract: true,
        controller: 'mbWorkspaceCtrl'
      })
      .state('node', {
        url: '{path:(?:/.*)?}',
        parent: 'workspace',
        resolve: {
          node: ['$rootScope', '$q', '$stateParams', 'mbObjectMapper', 'mbTreeCache', function($rootScope, $q, $stateParams, ObjectMapper, TreeCache) {
            var path = ($stateParams.path) ? $stateParams.path : '/',
                params = {};

            if (firstLoad) {
              $rootScope.$emit('browser.load');
              params = { reducedTree: true, cache: false };
            }


            return ObjectMapper.find('/' + $stateParams.repository + '/' + $stateParams.workspace + path, params).then(function(node) {
              if (firstLoad) {
                firstLoad = false;
                TreeCache.buildRichTree(node).then(function() {
                  $rootScope.$emit('browser.loaded');
                });
              }

              $rootScope.currentNode = node;
              return node;
            });
          }]
        },
        templateUrl: '/assets/js/browser/views/workspace/properties.html',
        controller: 'mbPropertiesCtrl'
      });

    $translateProvider
      .useCookieStorage()
      .translations('en', localeEN)
      .translations('fr', localeFR)
      .fallbackLanguage('en')
      .registerAvailableLanguageKeys(['en', 'fr'], {
        'en_US': 'en',
        'en_UK': 'en',
        'fr_FR': 'fr',
        'de_DE': 'en',
        'it_IT': 'en'
      })
      .determinePreferredLanguage();

  })
  .config(function($provide) {
    $provide.decorator('$window', ['$delegate', function($delegate) {
      $delegate.requestAnimFrame = (function(){
        return (
            $delegate.requestAnimationFrame       ||
            $delegate.webkitRequestAnimationFrame ||
            $delegate.mozRequestAnimationFrame    ||
            $delegate.oRequestAnimationFrame      ||
            $delegate.msRequestAnimationFrame     ||
            function(/* function */ callback){
              $delegate.setTimeout(callback, 1000 / 60);
            }
        );
      })();
      return $delegate;
    }]);
  })
  .run(['$rootScope', '$log', '$translate', 'toaster', 'editableOptions', 'mbEventBridge', 'mbMenu', 'mbMenuBuilderFactory', function($rootScope, $log, $translate, toaster, editableOptions, EventBridge, Menu, MenuBuilderFactory) {
    editableOptions.theme = 'bs3';

    var logListenerFactory = function(title, toastType) {
      return function(message, toast, display) {
        display = display === undefined ? true : display;
        if (display) {
          if (toast) { message = toast; }
          $translate(title).then(function(translation) {
            toaster.pop(toastType, translation, message);
          }, function(err) {
            toaster.pop(toastType, err, message);
          });
        }
      };
    };

    $log.before('error', logListenerFactory('ERROR', 'error'));
    $log.before('log',   logListenerFactory('SUCCESS', 'success'));
    $log.before('info',  logListenerFactory('NOTE', 'note'));
    $log.before('warn',  logListenerFactory('WARNING', 'warning'));

    $log.decorate(function(message) {
      return [message]; // To remove toast in the log
    });

    $rootScope.$on('$stateChangeError', function(evt, toState, toParams, fromState, fromParams, err) {
      if (err.data && err.data.message) {
        return $log.error(err, err.data.message);
      }
      $translate('ERROR_RETRY', function(translation) {
        $log.error(err, translation);
      }, function() {
        $log.error(err);
      });
    });

    $rootScope.$on('workspace.open.start', function() {
      // When changing workspace, we need to rebuild the RichTree cached by TreeCache
      firstLoad = true;
    });

    Menu.appendBuilder(MenuBuilderFactory.getRepositoriesBuilder());
    Menu.appendBuilder(MenuBuilderFactory.getRepositoryBuilder());
    Menu.appendBuilder(MenuBuilderFactory.getNodeBuilder());
  }]);
});
