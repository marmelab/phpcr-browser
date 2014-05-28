/* global define */
/* jshint indent:2 */

define([], function() {
  'use strict';

  return {
    validate: function(value) {
      return value instanceof Date && !isNaN(value.getTime());
    },
    override: function(value) {
      if (!this.validate(value)) {
        var date = new Date(value);
        return this.validate(date) ? date : new Date();
      }

      return value;
    }
  };
});
