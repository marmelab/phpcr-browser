/*global define,describe,it,expect*/
/* jshint indent:2 */

define([
  'services/validators/string',
  'angular',
  'angularMocks',
  'app',
], function (stringValidator) {
  'use strict';

  describe('Service: validator/string', function () {
    it('should only validate string', function () {
      expect(stringValidator.validate('I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters')).toBe(true);
      expect(stringValidator.validate(98755789)).toBe(false);
      expect(stringValidator.validate(8978.809)).toBe(false);
      expect(stringValidator.validate(false)).toBe(false);
      expect(stringValidator.validate(new Date())).toBe(false);
      expect(stringValidator.validate({})).toBe(false);
      expect(stringValidator.validate([])).toBe(false);
    });

    it('should override to string', function () {
      var str = 'I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters';
      expect(stringValidator.override(str)).toBe(str);

      var integer = 98755789;
      expect(stringValidator.override(integer)).toBe('98755789');

      var floating = 8978.809;
      expect(stringValidator.override(floating)).toBe('8978.809');

      var bool = false;
      expect(stringValidator.override(bool)).toBe('false');

      var date = new Date();
      expect(stringValidator.override(date)).toBe(date.toString());

      var obj = {};
      expect(stringValidator.override(obj)).toBe(obj.toString());

      var array = [];
      expect(stringValidator.override(array)).toBe(array.toString());
    });
  });
});
