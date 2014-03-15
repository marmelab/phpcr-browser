(function(angular) {
  'use strict';

  angular.module('browserApp', ['ui.router', 'ui.keypress', 'restangular', 'talker', 'toaster'])
  .config(function($stateProvider, $urlRouterProvider, RestangularProvider){
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
  })
  .run(['$rootScope', '$log', 'toaster', function($rootScope, $log, toaster) {
    $log.after('error', function(message, toast) {
      if (toast) { message = toast; }
      toaster.pop('error', 'An error occured', message);
    });
    $log.after('log', function(message, toast) {
      if (toast) { message = toast; }
      toaster.pop('success', 'Success', message);
    });
    $log.after('info', function(message, toast) {
      if (toast) { message = toast; }
      toaster.pop('note', 'Information', message);
    });
    $log.after('warn', function(message, toast) {
      if (toast) { message = toast; }
      toaster.pop('warning', 'Warning', message);
    });

    $rootScope.$on('browser.load', function() {
      $('#overlay').show();
    });

    $rootScope.$on('browser.loaded', function() {
      $('#overlay').hide();
    });
  }]);
})(angular);
