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

    return (function(){
        var result;
        return {
          then: function(cb) {
            result = cb(output);

            if (result && result.then) {
              return result;
            }

            return buildPromise(result);
          },
          'finally': function(cb) {
            cb();
            return this;
          }
        };
      }());
  };

  return {
    buildUrl: buildUrl,
    buildPromise: buildPromise
  };
});
