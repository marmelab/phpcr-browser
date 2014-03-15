(function($, angular, app) {
  'use strict';

  app.controller('mbPropertiesCtrl', ['$scope', '$log', '$filter', '$timeout', '$location', 'mbRouteParametersConverter',
    function($scope, $log, $filter, $timeout, $location, RouteParametersConverter) {
      var rawProperties;
      $scope.displayCreateForm = false;

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.toggleCreateForm = function() {
        $scope.displayCreateForm = !$scope.displayCreateForm;
      };

      $scope.backup = null;

      $scope.$on('drop.delete', function(e, element) {
        if (element.hasClass('property-item')) {
          $scope.deleteProperty(element.data('name'));
        }
      });

      $scope.deleteProperty = function(name) {
        var temp = { name: name, value: angular.copy(rawProperties[name].value), type: rawProperties[name].type };


        $scope.currentNode.deleteProperty(name).then(function() {
          $scope.backup = temp;
          $timeout(function() {
            $scope.backup = null;
          }, 10000);

          $log.log('Property deleted');
          $scope.properties = normalize($scope.currentNode.getProperties());
          $location.hash('restore');
        }, function(err) {
          if (err.status === 423) { return $log.warn(err, 'You can not delete this property. It is locked.'); }
          $log.error(err);
        });
      };

      $scope.createProperty = function(name, value, type, restored) {
        if (!restored) {
          if (!name || name.length === 0) {
            return $log.error('Name is empty');
          } else if (!value || value.length === 0) {
            return $log.error('Value is empty');
          }
        }

        $scope.currentNode.createProperty(name, value).then(function() {
          if (restored) { $log.log('Property restored'); $scope.backup = null; } else { $log.log('Property created'); }
          $scope.properties = normalize($scope.currentNode.getProperties());
          $scope.name = $scope.value = undefined;
          $scope.displayCreateForm = false;
        }, function(err) {
          $log.error(err);
        });
      };

      $scope.restoreProperty = function() {
        $scope.createProperty($scope.backup.name, $scope.backup.value, $scope.backup.type, true);
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
        rawProperties = $scope.currentNode.getProperties();
        $scope.properties = normalize(rawProperties);
      }, function(err) {
        $log.error(err);
      });

      $scope.typeof = function(o) { return typeof(o); };
    }]);
})($, angular, angular.module('browserApp'));
