(function(angular) {
  'use strict';

  angular.module('browserApp', ['ui.router', 'restangular'])
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
  .run();
})(angular);
