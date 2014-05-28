/*global define,describe,it,expect*/
/* jshint indent:2 */

define([
  'services/validators/integer',
  'angular',
  'angularMocks',
  'app',
], function (integerValidator) {
  'use strict';

  describe('Service: validator/integer', function () {
    it('should only validate integer', function () {
      expect(integerValidator.validate('I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters')).toBe(false);
      expect(integerValidator.validate(98755789)).toBe(true);
      expect(integerValidator.validate(8978.809)).toBe(false);
      expect(integerValidator.validate(false)).toBe(false);
      expect(integerValidator.validate(new Date())).toBe(false);
      expect(integerValidator.validate({})).toBe(false);
      expect(integerValidator.validate([])).toBe(false);
    });

    it('should override to integer', function () {
      var str = 'I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters';
      expect(integerValidator.override(str)).toBeNaN();

      var integer = 98755789;
      expect(integerValidator.override(integer)).toBe(parseInt(integer));

      var integering = 8978.809;
      expect(integerValidator.override(integering)).toBe(parseInt(integering));

      var bool = false;
      expect(integerValidator.override(bool)).toBeNaN();

      var date = new Date();
      expect(integerValidator.override(date)).toBeNaN();

      var obj = {};
      expect(integerValidator.override(obj)).toBeNaN();

      var array = [];
      expect(integerValidator.override(array)).toBeNaN();
    });
  });
});
