/*global define,describe,it,expect*/
/* jshint indent:2 */

define([
  'services/validators/binary',
  'angular',
  'angularMocks',
  'app',
], function (binaryValidator) {
  'use strict';

  describe('Service: validator/binary', function () {
    it('should validate everything', function () {
      expect(binaryValidator.validate('I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters')).toBe(true);
      expect(binaryValidator.validate(98755789)).toBe(true);
      expect(binaryValidator.validate(8978.809)).toBe(true);
      expect(binaryValidator.validate(false)).toBe(true);
      expect(binaryValidator.validate(new Date())).toBe(true);
      expect(binaryValidator.validate({})).toBe(true);
      expect(binaryValidator.validate([])).toBe(true);
    });

    it('should not override', function () {
      var str = 'I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters';
      expect(binaryValidator.override(str)).toBe(str);

      var integer = 98755789;
      expect(binaryValidator.override(integer)).toBe(integer);

      var floating = 8978.809;
      expect(binaryValidator.override(floating)).toBe(floating);

      var bool = false;
      expect(binaryValidator.override(bool)).toBe(bool);

      var date = new Date();
      expect(binaryValidator.override(date)).toBe(date);

      var obj = {};
      expect(binaryValidator.override(obj)).toBe(obj);

      var array = [];
      expect(binaryValidator.override(array)).toBe(array);
    });
  });
});
