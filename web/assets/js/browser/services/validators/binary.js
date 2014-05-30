/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

  return {
    validate: function() {
      return true;
    },
    override: function(value) {
      return value;
    }
  };
});
