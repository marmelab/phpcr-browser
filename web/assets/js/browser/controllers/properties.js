/* global define, $ */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'helpers/normalize-properties',
  'filters/properties-sorter'
], function(app, angular, normalizeProperties) {
  'use strict';

  app.controller('mbPropertiesCtrl', ['$scope', '$log', '$filter', '$timeout', '$location', '$translate', 'mbConfig',
    function($scope, $log, $filter, $timeout, $location, $translate, Config) {
      var rawProperties;

      $scope.displayCreateForm = false;
      $scope.newProperty = {};
      $scope.types = Config.node.property.types;
      $scope.backup = null;

      var loaders = {
        metadata: function() {
          $scope.supportsPropertyDelete = $scope.currentNode.getWorkspace().getRepository().supports('node.property.delete');
        },
        breadcrumb: function() {
          if ($scope.currentNode.getPath() !== '/') {
            var components = $scope.currentNode.getPath().split('/');
            components.shift();
            $scope.breadcrumb = components;
          } else {
            $scope.breadcrumb = [];
          }
        },
        properties: function(cache) {
          cache = cache === undefined ? false : cache;
          $scope.currentNode.getProperties(cache).then(function(properties) {
            rawProperties = properties;
            $scope.properties = normalizeProperties(rawProperties);
          });
        }
      };

      $scope.keyBinding = {
        createForm : {
          keypress: {
            enter: function() {
              var type = $scope.newProperty.type ? $scope.newProperty.type.value : $scope.types[0].value;
              $scope.createProperty($scope.newProperty.name, $scope.newProperty.value, type);
            }
          },
          keydown: {
            esc: function() {
              $scope.toggleCreateForm();
            }
          }
        }
      };

      $scope.createProperty = function(name, value, type, path) {
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
            loaders.properties();
            $translate('NODE_ADD_PROPERTY_SUCCESS').then($log.log, $log.log);
          });
        }

        return $scope.currentNode.createProperty(name, value, type).then(function() {
          $translate('NODE_ADD_PROPERTY_SUCCESS').then($log.log, $log.log);
          loaders.properties();
          $scope.newProperty = {};
          $scope.displayCreateForm = false;
        });
      };

      $scope.toggleCreateForm = function() {
        $scope.displayCreateForm = !$scope.displayCreateForm;
      };

      $scope.typeLabel = function(value) {
        if ($scope.types[value]) { return $scope.types[value].name; }
        return 'undefined';
      };

      $scope.deleteProperty = function(name, path) {
        rawProperties[name].getValue(path).then(function(value) {
          var temp = { name: name, value: angular.copy(value), path: path, type: rawProperties[name].getType() };

          rawProperties[name].delete(path).then(function() {
            $('.scrollable-properties').scrollTop(0);
            loaders.properties();
            if (!(path && path !== '/')) {
              $scope.backup = temp;
              $timeout(function() {
                $scope.backup = null;
              }, 10000);
              $location.hash('restore');
            }
            return $translate('NODE_DELETE_PROPERTY_SUCCESS').then($log.log, $log.log);
          });
        }, $log.error);
      };

      $scope.restoreProperty = function() {
        $scope.createProperty($scope.backup.name, $scope.backup.value, $scope.backup.type).then(function() {
          $scope.backup = null;
        });
      };

      $scope.updateProperty = function(name, value, path) {
        rawProperties[name].update(path, value).then(function() {
          loaders.properties();
          return $translate('NODE_UPDATE_PROPERTY_SUCCESS').then($log.log, $log.log);
        });
      };

      $scope.updatePropertyType = function(name, type) {
        rawProperties[name].setType(type).then(function() {
          loaders.properties();
          return $translate('NODE_UPDATE_PROPERTY_SUCCESS').then($log.log, $log.log);
        });
      };

      $scope.typeof = function(o) { return typeof(o); };

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.$on('drop.delete', function(e, element) {
        if (element.hasClass('property-item')) {
          $scope.deleteProperty(element.data('name'));
        }
      });

      $scope.$watch('currentNode', function(node) {
        if (node) {
          loaders.metadata();
          loaders.breadcrumb();
          loaders.properties(true);
        }
      });
    }]);
});
