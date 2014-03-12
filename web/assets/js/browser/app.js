(function(angular) {
  'use strict';

  var app = angular.module('browserApp', ['ui.router', 'restangular'])
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
        url: '/:repository/{workspace:.+}',
        templateUrl: '/assets/js/browser/views/workspace.html'
      })
      .state('node', {
        url: '/:repository/:workspace/{path:.*}',
        templateUrl: '/assets/js/browser/views/workspace.html'
      });
  })
  .filter('propertyNameFilter', function() {
    return function(input, term) {
      var regex = new RegExp(term, 'i');
      var obj = {};
      angular.forEach(input, function(v, i){
        if(regex.test(i + '')){
          obj[i]=v;
        }
      });
      return obj;
    };
  })
  .run(function ($rootScope) {

  });

  return app;
})(angular);
