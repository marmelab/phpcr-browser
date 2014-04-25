/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/json-patch',
], function(app) {
  'use strict';

  app.factory('mbSmartProperty', ['$q', 'mbJsonPatch', function($q, JsonPatch) {

    var SmartProperty = function(property, node) {
      this._property = property;
      this._node = node;
    };

    SmartProperty.prototype.getName = function() {
      return this._property.name;
    };

    SmartProperty.prototype.getType = function() {
      return this._property.type;
    };

    SmartProperty.prototype.setType = function(type) {
      var deferred = $q.defer(), self = this;
      this._node.setProperty(this.getName(), this._property.value, type).then(function(data) {
        self._property.type = type;
        deferred.resolve(data);
      }, deferred.reject);
      return deferred.promise;
    };

    SmartProperty.prototype.getValue = function(path) {
      var deferred = $q.defer(), self = this;
      if (!path || path === '/') {
        deferred.resolve(this._property.value);
      } else {
        JsonPatch.then(function(patcher) {
          var patchedValue = patcher.get(self._property.value, path);
          deferred.resolve(patchedValue);
        }, deferred.reject);
      }
      return deferred.promise;
    };

    SmartProperty.prototype.setValue = function(value) {
      var deferred = $q.defer(), self = this;
      this._node.setProperty(this.getName(), value, this.getType()).then(function(data) {
        self._property.value = value;
        deferred.resolve(data);
      }, deferred.reject);
      return deferred.promise;
    };

    SmartProperty.prototype.insert = function(path, value) {
      if (!path || path === '/') {
        return this.setValue(value);
      }

      var deferred = $q.defer(), self = this;
      JsonPatch.then(function(patcher) {
        var patchedValue = patcher.insert(self._property.value, path, value);
        self.setValue(patchedValue).then(deferred.resolve, deferred.reject);
      }, deferred.reject);

      return deferred.promise;
    };

    SmartProperty.prototype.update = function(path, value) {
      if (!path || path === '/') {
        return this.setValue(value);
      }

      var deferred = $q.defer(), self = this;
      JsonPatch.then(function(patcher) {
        var patchedValue = patcher.update(self._property.value, path, value);
        self.setValue(patchedValue).then(deferred.resolve, deferred.reject);
      }, deferred.reject);

      return deferred.promise;
    };

    SmartProperty.prototype.delete = function(path) {
      if (!path || path === '/') {
        return this._node.deleteProperty(this.getName());
      }

      var deferred = $q.defer(), self = this;
      JsonPatch.then(function(patcher) {
        var patchedValue = patcher.delete(self._property.value, path);
        self.setValue(patchedValue).then(deferred.resolve, deferred.reject);
      }, deferred.reject);

      return deferred.promise;
    };

    return {
      build: function(property, node) {
        return new SmartProperty(property, node);
      },
      accept: function(data) {
        return data.name !== undefined &&data.type !== undefined && data.value !== undefined;
      }
    };
  }]);
});
