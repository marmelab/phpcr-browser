/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.factory('mbJsonPatch', ['$document', '$q', '$rootScope', function ($document, $q, $rootScope) {
    var defered = $q.defer();
    var onScriptLoad = function() {
      // Load client in the browser
      $rootScope.$apply(function() {
        var jsonpatch = window.jsonpatch;
        var factory = {
          update: function(datum, path, value) {
            var _patch = [{ 'op': 'replace', 'path': path, 'value': value }];
            return jsonpatch.apply_patch(datum, _patch);
          },
          delete: function(datum, path) {
            var _patch = [{ 'op': 'remove', 'path': path }];
            return jsonpatch.apply_patch(datum, _patch);
          },
          insert: function(datum, path, value) {
            var _patch = [{ 'op': 'add', 'path': path, 'value': value }];
            return jsonpatch.apply_patch(datum, _patch);
          },
          get: function(datum, path) {
            path = path.split('/');
            path.shift();

            if (path.length === 0) { return datum; }
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
        defered.resolve(factory);
      });
    };
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = '/bower_components/jsonpatch/jsonpatch.min.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') { onScriptLoad(); }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);
    return defered.promise;
  }]);
});
