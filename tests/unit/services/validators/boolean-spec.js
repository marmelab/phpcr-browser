/*global define,describe,it,expect*/
/* jshint indent:2 */

define([
  'services/validators/boolean',
  'angular',
  'angularMocks',
  'app',
], function (booleanValidator) {
  'use strict';

  describe('Service: validator/boolean', function () {
    it('should only validate boolean', function () {
      expect(booleanValidator.validate('I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters')).toBe(false);
      expect(booleanValidator.validate(98755789)).toBe(false);
      expect(booleanValidator.validate(8978.809)).toBe(false);
      expect(booleanValidator.validate(false)).toBe(true);
      expect(booleanValidator.validate(new Date())).toBe(false);
      expect(booleanValidator.validate({})).toBe(false);
      expect(booleanValidator.validate([])).toBe(false);
    });

    it('should override to boolean', function () {
      var str = 'I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters';
      expect(booleanValidator.override(str)).toBe(!!str);

      var integer = 98755789;
      expect(booleanValidator.override(integer)).toBe(!!integer);

      var floating = 8978.809;
      expect(booleanValidator.override(floating)).toBe(!!floating);

      var bool = false;
      expect(booleanValidator.override(bool)).toBe(!!bool);

      var date = new Date();
      expect(booleanValidator.override(date)).toBe(!!date);

      var obj = {};
      expect(booleanValidator.override(obj)).toBe(!!obj);

      var array = [];
      expect(booleanValidator.override(array)).toBe(!!array);
    });
  });
});
