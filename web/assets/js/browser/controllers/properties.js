(function(angular, app) {
  'use strict';

  app.controller('mbPropertiesCtrl', ['$scope', '$log', '$filter', '$timeout', '$location', 'mbJsonPatch',
    function($scope, $log, $filter, $timeout, $location, JsonPatch) {
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

      $scope.types = [
        { name: 'undefined', value: 0},
        { name: 'String', value: 1},
        { name: 'Binary', value: 2},
        { name: 'Long', value: 3},
        { name: 'Double', value: 4},
        { name: 'Date', value: 5},
        { name: 'Boolean', value: 6},
        { name: 'Name', value: 7},
        { name: 'Path', value: 8},
        { name: 'Reference', value: 9},
        { name: 'WeakReference', value: 10},
        { name: 'URI', value: 11},
        { name: 'Decimal', value: 12},
      ];

      $scope.typeLabel = function(value) {
        if ($scope.types[value]) { return $scope.types[value].name; }
        return 'undefined';
      };

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
          if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          $log.error(err);
        });
      };

      $scope.restoreProperty = function() {
        $scope.createProperty($scope.backup.name, $scope.backup.value, $scope.backup.type, true);
      };

      var normalize = function(data, parent, parentType, parentName) {
        var array = [];
        var separator = '/';
        for (var i in data) {
          if (!data) { continue; }
          var value, type, path, pname;
          if (parent && typeof(data[i]) === 'object') {
            type = parentType;
            value = normalize(data[i], i, parentType, parentName);
            path = parent + separator + i;
            pname = parentName;
          } else if (!parent && typeof(data[i].value) === 'object') {
            type = data[i].type;
            value = normalize(data[i].value, i, data[i].type, i);
            path = separator;
            parentName = i;
          } else if (parent) {
            type = parentType;
            value = data[i];
            path = parent + separator + i;
            pname = parentName;
          } else {
            type = data[i].type;
            value = data[i].value;
            path = separator;
            pname = i;
          }
          path = path.split(separator);
          path.shift();
          path = separator + path.join(separator);
          array.push({ name: i, value: value, type: type, path: path, parentName: pname});
        }
        return  array;
      };

      $scope.updateProperty = function(name, value, type, path) {
        console.log(arguments);
        var patch = [{ 'op': 'replace', 'path': path, 'value': value }];
        JsonPatch.then(function(jsonpatch) {console.log(path);
          if (path && path !== '/') {
            value = jsonpatch.apply_patch($scope.currentNode.getProperties()[name].value, patch);
            console.log(value);
          }
          $scope.currentNode.setProperty(name, value, type).then(function(){
            $log.log('Property updated.');
          }, function(err) {
            rawProperties = $scope.currentNode.getProperties();
            $scope.properties = normalize(rawProperties);
            if (err.data && err.data.message) { return $log.error(err, err.data.message); }
            $log.error(err);
          });
        });
      };

      $scope.$watch('currentNode', function(node) {
        if (node) {
          rawProperties = node.getProperties();
          $scope.properties = normalize(rawProperties);
        }
      });

      $scope.typeof = function(o) { return typeof(o); };
    }]);
})(angular, angular.module('browserApp'));
