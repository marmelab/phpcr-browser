/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

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

  return normalize;
});
