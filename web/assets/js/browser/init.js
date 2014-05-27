/* global define */
/* jshint indent:2 */

define([
  'angular',
  'app',
  'locales/en_EN',
  'config',
  'controllers/front',
  'services/event-bridge',
  'services/api-foundation',
  'services/menu',
  'services/menu-builder-factory'
], function(angular, app, localeEN) {
  'use strict';

  app.value('$anchorScroll', angular.noop)
  .config(function($stateProvider, $urlRouterProvider, $translateProvider, RestangularProvider, mbApiFoundationProvider, mbConfig){
    mbApiFoundationProvider.setServer(mbConfig.api.server);
    mbApiFoundationProvider.setRepositoriesPrefix(mbConfig.api.prefixes.repositories);
    mbApiFoundationProvider.setWorkspacesPrefix(mbConfig.api.prefixes.workspaces);
    mbApiFoundationProvider.setNodesPrefix(mbConfig.api.prefixes.nodes);

    RestangularProvider.setDefaultHttpFields({cache: true});
    $urlRouterProvider
      .when('', '/')
      .otherwise('/');

    $stateProvider
      .state('repositories', {
        url:'/',
        templateUrl: '/assets/js/browser/views/repositories.html'
      })
      .state('repository', {
        url: '/:repository',
        templateUrl: '/assets/js/browser/views/repository.html'
      })
      .state('workspace', {
        url: '/:repository/:workspace{path:(?:/.*)?}',
        templateUrl: '/assets/js/browser/views/workspace.html'
      });

    $translateProvider.translations('en', localeEN);
    $translateProvider.preferredLanguage('en');

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
  .run(['$rootScope', '$log', 'toaster', 'editableOptions', 'mbEventBridge', 'mbMenu', 'mbMenuBuilderFactory', function($rootScope, $log, toaster, editableOptions, EventBridge, Menu, MenuBuilderFactory) {
    editableOptions.theme = 'bs3';

    $log.before('error', function(message, toast, display) {
      display = display === undefined ? true : display;
      if (display) {
        if (toast) { message = toast; }
        toaster.pop('error', 'An error occured', message);
      }
    });
    $log.before('log', function(message, toast, display) {
      display = display === undefined ? true : display;
      if (display) {
        if (toast) { message = toast; }
        toaster.pop('success', 'Success', message);
      }
    });
    $log.before('info', function(message, toast, display) {
      display = display === undefined ? true : display;
      if (display) {
        if (toast) { message = toast; }
        toaster.pop('note', 'Information', message);
      }
    });
    $log.before('warn', function(message, toast, display) {
      display = display === undefined ? true : display;
      if (display) {
        if (toast) { message = toast; }
        toaster.pop('warning', 'Warning', message, display);
      }
    });

    $log.decorate(function(message) {
      return [message]; // To remove toast in the log
    });

    Menu.appendBuilder(MenuBuilderFactory.getRepositoriesBuilder());
    Menu.appendBuilder(MenuBuilderFactory.getRepositoryBuilder());
    Menu.appendBuilder(MenuBuilderFactory.getWorkspaceBuilder());
  }]);
});
