/* global define */
/* jshint indent:2 */

define([
  'app',
  'jsonpatch'
], function(app, JSONPatch) {
  'use strict';

  app.factory('mbJsonPatch', function () {
    var factory = {
      update: function(datum, path, value) {
        var _patch = [{ 'op': 'replace', 'path': path, 'value': value }];
        return JSONPatch.apply_patch(datum, _patch);
      },
      delete: function(datum, path) {
        var _patch = [{ 'op': 'remove', 'path': path }];
        return JSONPatch.apply_patch(datum, _patch);
      },
      insert: function(datum, path, value) {
        var _patch = [{ 'op': 'add', 'path': path, 'value': value }];
        return JSONPatch.apply_patch(datum, _patch);
      },
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
    return factory;
  });
});
