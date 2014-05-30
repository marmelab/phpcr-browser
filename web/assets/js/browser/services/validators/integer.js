/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

  return {
    validate: function(value) {
      return typeof(value) === 'number' && value % 1 === 0;
    },
    override: function(value) {
      return parseInt(value);
    }
  };
});
