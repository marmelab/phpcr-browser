(function(angular, app) {
  'use strict';

  app.controller('mbPropertiesCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });


      var normalize = function(data) {
        var array = [];
        for (var i in data) {
          if (typeof(data[i]) === 'object') { data[i] = normalize(data[i]); }
          array.push({ name: i, value: data[i] });
        }console.log(array);
        return  array;
      };

      mbRouteParametersConverter.getCurrentNode().then(function(node) {
        $scope.properties = normalize(node.getProperties());
      }, function(err) {
        $log.error(err);
      });

      $scope.typeof = function(o) { return typeof(o); };
    }]);
})(angular, angular.module('browserApp'));
