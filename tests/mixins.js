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

  return {
    buildUrl: buildUrl
  };
});
