/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

  return {
    validate: function(value) {
      return typeof(value) === 'boolean';
    },
    override: function(value) {
      return !!value;
    }
  };
});
