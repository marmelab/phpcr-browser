/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

  return {
    validate: function(value) {
      return typeof(value) === 'string';
    },
    override: function(value) {
      return '' + value;
    }
  };
});
