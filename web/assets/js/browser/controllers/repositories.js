/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/ui/repository',
  'services/object-mapper'
], function(app) {
  'use strict';

  app.controller('mbRepositoriesCtrl', ['$scope', '$location', 'repositories',
    function($scope, $location, repositories) {
      $scope.repositories = repositories;

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.openRepository = function(repository) {
        $location.path('/' + repository.getName());
      };
    }]);
});
