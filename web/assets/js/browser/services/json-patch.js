/* global define */
/* jshint indent:2 */

define([
  'app',
  'jsonpatch'
], function(app, JSONPatch) {
  'use strict';

  /**
   * JsonPatch is an Angular integration fo JSONPatch library to manipulate JSON
   */
  app.factory('mbJsonPatch', function () {
    return {
      /**
       * Update a json value
       * @param  {object} datum
       * @param  {string} path
       * @param  {mixed} value
       * @return {object}
       */
      update: function(datum, path, value) {
        var _patch = [{ 'op': 'replace', 'path': path, 'value': value }];
        return JSONPatch.apply_patch(datum, _patch);
      },

      /**
       * Delete a json value
       * @param  {object} datum
       * @param  {string} path
       * @return {object}
       */
      delete: function(datum, path) {
        var _patch = [{ 'op': 'remove', 'path': path }];
        return JSONPatch.apply_patch(datum, _patch);
      },

      /**
       * Insert a value in a json
       * @param  {object} datum
       * @param  {string} path
       * @param  {mixed} value
       * @return {objet}
       */
      insert: function(datum, path, value) {
        var _patch = [{ 'op': 'add', 'path': path, 'value': value }];
        return JSONPatch.apply_patch(datum, _patch);
      },

      /**
       * Get a json value
       * @param  {object} datum
       * @param  {string} path
       * @return {mixed}
       */
      get: function(datum, path) {
        if (path === '/') { return datum; }
        path = path.split('/');
        path.shift();

        for (var i in datum) {
          if (i === path[0]) {
            path.shift();
            path = '/' + path.join('/');
            return this.get(datum[i], path);
          }
        }
        return null;
      }
    };
  });
});
