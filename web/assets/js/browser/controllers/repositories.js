/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/ui/repository',
  'services/object-mapper'
], function(app) {
  'use strict';

  app.controller('mbRepositoriesCtrl', ['$scope', '$location', '$log', '$translate', 'mbObjectMapper',
    function($scope, $location, $log, $translate, ObjectMapper) {
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
        $translate('ERROR_RETRY', function(translation) {
          $log.error(err, translation);
        }, function() {
          $log.error(err);
        });
      });
    }]);
});
