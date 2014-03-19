(function(angular) {
  'use strict';

  angular.module('browserApp', ['ui.router', 'restangular', 'talker', 'toaster'])
  .config(function($stateProvider, $urlRouterProvider){
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
  .run(['$log', 'toaster', function($log, toaster) {
    $log.after('error', function(message) {
      toaster.pop('error', 'An error occured', message);
    });
    $log.after('log', function(message) {
      toaster.pop('success', 'Success', message);
    });
    $log.after('info', function(message) {
      toaster.pop('note', 'Information', message);
    });
    $log.after('warn', function(message) {
      toaster.pop('warning', 'Warning', message);
    });
  }]);
})(angular);
