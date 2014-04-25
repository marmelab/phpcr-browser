/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/ui/repository',
  'services/object-mapper'
], function(app) {
  'use strict';

  app.controller('mbRepositoriesCtrl', ['$scope', '$location', '$log', 'mbObjectMapper',
    function($scope, $location, $log, ObjectMapper) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.openRepository = function(repository) {
        $location.path('/' + repository.getName());
      };

      $scope.$emit('browser.load');
      ObjectMapper.find().then(function(repositories) {
        $scope.repositories = repositories;
        $scope.$emit('browser.loaded');
      }, function(err) {
        $log.error(err, 'An error occurred, please retry.');
      });
    }]);
});
