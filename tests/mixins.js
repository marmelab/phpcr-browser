/*global define*/
/* jshint indent:2 */

define('mixins', [], function () {
  'use strict';

  var buildUrl = function(components, firstSlash) {
    var url = components.join('/');
    if (firstSlash) {
      return '/' + url;
    }
    return url;
  };

  var buildPromise = function(output) {
    return {
      then: function(cb) {
        var result = cb(output);

        if (result && result.then) {
          return result;
        }

        return buildPromise(result);
      }
    };
  };

  return {
    buildUrl: buildUrl,
    buildPromise: buildPromise
  };
});
