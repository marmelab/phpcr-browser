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
  .filter('mbProperty', function() {
    return function(input, term) {
      var regex = new RegExp(term, 'i');
      var obj = [];
      angular.forEach(input, function(v){
        if(regex.test(v.name + '')){
          obj.push(v);
        }
      });
      return obj;
    };
  })
  .run();
})(angular);
