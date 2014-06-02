/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/json-patch',
], function(app) {
  'use strict';

  /**
   * SmartPropertyFactory is a factory to build SmartProperty object which are json object with patching features.
   */
  app.factory('mbSmartPropertyFactory', ['$q', 'mbJsonPatch', function($q, JsonPatch) {

    /**
     * SmartProperty constructor
     * @param {object} property
     * @param {Node} node
     */
    var SmartProperty = function(property, node) {
      this._property = property;
      this._node = node;
    };

    /**
     * Get the name of the property
     * @return {string}
     */
    SmartProperty.prototype.getName = function() {
      return this._property.name;
    };

    /**
     * Get the type of the property
     * @return {int}
     */
    SmartProperty.prototype.getType = function() {
      return this._property.type;
    };

    /**
     * Set the type of the property
     * @param {int} type
     * @return {promise}
     */
    SmartProperty.prototype.setType = function(type) {
      var self = this;
      return this._node.setProperty(this.getName(), this._property.value, type).then(function(data) {
        self._property.type = type;
        return data;
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Get the value of the property
     * @param  {string} path
     * @return {promise}
     */
    SmartProperty.prototype.getValue = function(path) {
      var self = this;
      if (!path || path === '/') {
        return $q.when(this._property.value);
      }

      var patchedValue = JsonPatch.get(self._property.value, path);
      return $q.when(patchedValue);
    };

    /**
     * Set value of the property
     * @param {mixed} value
     * @return {promise}
     */
    SmartProperty.prototype.setValue = function(value) {
      var self = this;
      return this._node.setProperty(this.getName(), value, this.getType()).then(function(data) {
        self._property.value = value;
        return data;
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Insert a sub value in the property value
     * @param  {string} path
     * @param  {mixed} value
     * @return {promise}
     */
    SmartProperty.prototype.insert = function(path, value) {
      if (!path || path === '/') {
        return this.setValue(value);
      }

      var self = this;
      var patchedValue = JsonPatch.insert(self._property.value, path, value);
      return self.setValue(patchedValue);
    };

    /**
     * Update a sub value in the property value
     * @param  {string} path
     * @param  {mixed} value
     * @return {promise}
     */
    SmartProperty.prototype.update = function(path, value) {
      if (!path || path === '/') {
        return this.setValue(value);
      }

      var self = this;
      var patchedValue = JsonPatch.update(self._property.value, path, value);
      return self.setValue(patchedValue);
    };

    /**
     * Delete a sub value in the property value
     * @param  {string} path
     * @return {promise}
     */
    SmartProperty.prototype.delete = function(path) {
      if (!path || path === '/') {
        return this._node.deleteProperty(this.getName());
      }

      var self = this;
      var patchedValue = JsonPatch.delete(self._property.value, path);
      return self.setValue(patchedValue);
    };

    return {

      /**
       * Build a SmartProperty object
       * @param  {object} property
       * @param  {Node} node
       * @return {SmartProperty}
       */
      build: function(property, node) {
        return new SmartProperty(property, node);
      },

      /**
       * Test raw data validity
       * @param  {object} data
       * @return {boolean}
       */
      accept: function(data) {
        return data.name !== undefined && data.type !== undefined && data.value !== undefined;
      }
    };
  }]);
});
