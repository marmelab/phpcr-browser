/* global define */
/* jshint indent:2 */

define([
  'app',
  'validator/binary',
  'validator/boolean',
  'validator/date',
  'validator/float',
  'validator/integer',
  'validator/string'
], function(app, binaryValidator, booleanValidator, dateValidator, floatValidator, integerValidator, stringValidator) {
  'use strict';

  app.factory('mbValidator', function() {

    var validators = {
      binary:  binaryValidator,
      boolean: booleanValidator,
      date:    dateValidator,
      float:   floatValidator,
      integer: integerValidator,
      string:  stringValidator
    };

    /**
     * Validate a value based on a given type
     * @param  {mixed} value
     * @param  {string} type
     * @return {boolean}
     */
    var validate = function(value, type) {
      return validators[type].validate(value);
    };

    /**
     * Override a value based on a given type
     * @param  {mixed} value
     * @param  {string} type
     * @return {mixed}
     */
    var override = function(value, type) {
      return validators[type].override(value);
    };

    return {
      validate: validate,
      override: override
    };
  });
});
