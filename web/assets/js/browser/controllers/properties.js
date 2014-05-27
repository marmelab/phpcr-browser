/* global define, $ */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'filters/properties-sorter'
], function(app, angular) {
  'use strict';

  app.controller('mbPropertiesCtrl', ['$scope', '$log', '$filter', '$timeout', '$location', '$q', '$translate',
    function($scope, $log, $filter, $timeout, $location, $q, $translate) {
      var rawProperties;

      $scope.displayCreateForm = false;
      $scope.newProperty = {};

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

      var createProperty = function(name, value, type, path) {
        if (!$scope.backup) {
          if (!name || name.length === 0) {
            return $translate('NODE_ADD_PROPERTY_NAME_EMPTY').then($log.error, $log.error);
          } else if (!value || value.length === 0) {
            return $translate('NODE_ADD_PROPERTY_VALUE_EMPTY').then($log.error, $log.error);
          }
        }

        if (path) {
          path = path.split('/');
          path.pop();
          path = path.join('/');
          var datum = {};
          try {
            datum[name] = JSON.parse(value);
          } catch (e) {
            datum[name] = value;
          }

          return rawProperties[type].insert(path, datum).then(function() {
            reloadProperties();
            $translate('NODE_ADD_PROPERTY_SUCCESS').then($log.log, $log.log);
          }, function(err) {
            if (err.data && err.data.message) { return $log.error(err, err.data.message); }
            $log.error(err);
          });
        }

        return $scope.currentNode.createProperty(name, value).then(function() {
          $translate('NODE_ADD_PROPERTY_SUCCESS').then($log.log, $log.log);
          reloadProperties();
          $scope.name = $scope.value = undefined;
          $scope.displayCreateForm = false;
        }, function(err) {
          if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          $log.error(err);
          return $q.reject(err);
        });
      };

      $scope.toggleCreateForm = function() {
        $scope.displayCreateForm = !$scope.displayCreateForm;
      };

      $scope.keyBinding = {
        createForm : {
          keypress: {
            enter: function() {
              var type = $scope.newProperty.type ? $scope.newProperty.type.value : $scope.types[0].value;
              createProperty($scope.newProperty.name, $scope.newProperty.value, type.value);
            }
          },
          keydown: {
            esc: function() {
              $scope.toggleCreateForm();
            }
          }
        }
      };

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.backup = null;

      $scope.$on('drop.delete', function(e, element) {
        if (element.hasClass('property-item')) {
          $scope.deleteProperty(element.data('name'));
        }
      });

      var reloadMetadata = function() {
        $scope.supportsPropertyDelete = $scope.currentNode.getWorkspace().getRepository().supports('node.property.delete');
      };

      var reloadBreadcrumb = function() {
        if ($scope.currentNode.getPath() !== '/') {
          var components = $scope.currentNode.getPath().split('/');
          components.shift();
          $scope.breadcrumb = components;
        } else {
          $scope.breadcrumb = [];
        }
      };



      $scope.typeLabel = function(value) {
        if ($scope.types[value]) { return $scope.types[value].name; }
        return 'undefined';
      };

      var reloadProperties = function(cache) {
        cache = cache === undefined ? false : cache;
        $scope.currentNode.getProperties(cache).then(function(properties) {
          rawProperties = properties;
          $scope.properties = normalize(rawProperties);
        });
      };

      $scope.deleteProperty = function(name, path) {
        rawProperties[name].getValue(path).then(function(value) {
          var temp = { name: name, value: angular.copy(value), path: path, type: rawProperties[name].getType() };

          rawProperties[name].delete(path).then(function() {
            $('.scrollable-properties').scrollTop(0);
            reloadProperties();
            if (!(path && path !== '/')) {
              $scope.backup = temp;
              $timeout(function() {
                $scope.backup = null;
              }, 10000);
              $location.hash('restore');
            }
            return $translate('NODE_DELETE_PROPERTY_SUCCESS').then($log.log, $log.log);
          }, function(err) {
            if (err.status === 423) { return $translate('NODE_PROPERTY_LOCKED').then($log.warn, $log.warn); }
            else if (err.data && err.data.message) { return $log.error(err, err.data.message); }
            $log.error(err);
          });
        }, $log.error);
      };

      $scope.restoreProperty = function() {
        createProperty($scope.backup.name, $scope.backup.value, $scope.backup.type).then(function() {
          $scope.backup = null;
        });
      };

      var normalize = function(data, path, parentName, parentType) {
        var array = [];

        if (typeof(data) !== 'object') {
          return data;
        }

        for (var i in data) {
          var datum;
          if (!data) { continue; }
          if (!path) {
            datum = {
              name: i,
              value: normalize(data[i]._property.value, '/', i, data[i].getType()),
              type: data[i].getType(),
              path: '/'
            };
          } else {
            // Subproperty
            datum = {
              name: i,
              value: normalize(data[i], path + '/' + i, parentName, parentType),
              path: (path === '/') ? path + i : path + '/' + i,
              type: parentType,
              parentName: parentName
            };
          }
          array.push(datum);
        }
        return  array;
      };

      $scope.updateProperty = function(name, value, path) {
        rawProperties[name].update(path, value).then(function() {
          reloadProperties();
          return $translate('NODE_UPDATE_PROPERTY_SUCCESS').then($log.log, $log.log);
        }, function(err) {
          if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          $log.error(err);
        });
      };

      $scope.updatePropertyType = function(name, type) {
        rawProperties[name].setType(type).then(function() {
          reloadProperties();
          return $translate('NODE_UPDATE_PROPERTY_SUCCESS').then($log.log, $log.log);
        }, function(err) {
          if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          $log.error(err);
        });
      };

      $scope.$watch('currentNode', function(node) {
        if (node) {
          reloadMetadata();
          reloadBreadcrumb();
          reloadProperties(true);
        }
      });

      $scope.typeof = function(o) { return typeof(o); };
    }]);
});
