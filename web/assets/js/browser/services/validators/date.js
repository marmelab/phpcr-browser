/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

  return {
    validate: function(value) {
      return value instanceof Date;
    },
    override: function(value) {
      return this.valid(value) ? value : new Date(value);
    }
  };
});
