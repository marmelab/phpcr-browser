(function($, angular, app) {
  'use strict';

  app.controller('mbPropertiesCtrl', ['$scope', '$log', '$filter', 'mbRouteParametersConverter',
    function($scope, $log, $filter, RouteParametersConverter) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.$on('drop.delete', function(e, element) {
        if (element.hasClass('property-item')) {
          $scope.deleteProperty(element.data('name'));
        }
      });

      $scope.deleteProperty = function(name, path, type) {
        $scope.currentNode.deleteProperty(name, path, type).then(function() {
          $log.log('Property deleted');
          $scope.properties = normalize($scope.currentNode.getProperties());
        }, function(err) {
          if (err.status === 423) { return $log.warn(err, 'You can not delete this property. It is locked.'); }
          $log.error(err);
        });
      };

      var normalize = function(data, parent, parentType) {
        var array = [];
        for (var i in data) {
          if (!data) { continue; }
          var value, type, path;
          if (parent && typeof(data[i]) === 'object') {
            type = parentType;
            value = normalize(data[i], i, parentType);
            path = parent + '@@' + i;
          } else if (!parent && typeof(data[i].value) === 'object') {
            type = data[i].type;
            value = normalize(data[i].value, i, data[i].type);
            path = '@@';
          } else if (parent) {
            type = parentType;
            value = data[i];
            path = parent + '@@' + i;
          } else {
            type = data[i].type;
            value = data[i].value;
            path = '@@';
          }

          array.push({ name: i, value: value, type: type, path: path});
        }
        return  array;
      };


      RouteParametersConverter.getCurrentNode().then(function(node) {
        $scope.properties = normalize(node.getProperties());
      }, function(err) {
        $log.error(err);
      });

      $scope.typeof = function(o) { return typeof(o); };
    }]);
})($, angular, angular.module('browserApp'));
