/*global define,describe,it,expect*/
/* jshint indent:2 */

define([
  'services/validators/float',
  'angular',
  'angularMocks',
  'app',
], function (floatValidator) {
  'use strict';

  describe('Service: validator/float', function () {
    it('should only validate float', function () {
      expect(floatValidator.validate('I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters')).toBe(false);
      expect(floatValidator.validate(98755789)).toBe(false);
      expect(floatValidator.validate(8978.809)).toBe(true);
      expect(floatValidator.validate(false)).toBe(false);
      expect(floatValidator.validate(new Date())).toBe(false);
      expect(floatValidator.validate({})).toBe(false);
      expect(floatValidator.validate([])).toBe(false);
    });

    it('should override to float', function () {
      var str = 'I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters';
      expect(floatValidator.override(str)).toBeNaN();

      var integer = 98755789;
      expect(floatValidator.override(integer)).toBe(parseFloat(integer));

      var floating = 8978.809;
      expect(floatValidator.override(floating)).toBe(parseFloat(floating));

      var bool = false;
      expect(floatValidator.override(bool)).toBeNaN();

      var date = new Date();
      expect(floatValidator.override(date)).toBeNaN();

      var obj = {};
      expect(floatValidator.override(obj)).toBeNaN();

      var array = [];
      expect(floatValidator.override(array)).toBeNaN();
    });
  });
});
