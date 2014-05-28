/*global define,describe,it,expect*/
/* jshint indent:2 */

define([
  'services/validators/date',
  'angular',
  'angularMocks',
  'app',
], function (dateValidator) {
  'use strict';

  describe('Service: validator/date', function () {
    it('should only validate date', function () {
      expect(dateValidator.validate('I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters')).toBe(false);
      expect(dateValidator.validate(98755789)).toBe(false);
      expect(dateValidator.validate(8978.809)).toBe(false);
      expect(dateValidator.validate(false)).toBe(false);
      expect(dateValidator.validate(new Date())).toBe(true);
      expect(dateValidator.validate({})).toBe(false);
      expect(dateValidator.validate([])).toBe(false);
    });

    it('should override to date', function () {
      var str = 'I am a string with some specials §!("éç!àà)---_ù`^$^ù:;,;,:;= characters';
      expect(dateValidator.override(str)).toEqual(new Date()); // Invalid value is overriden to a empty Date object

      var integer = 98755789;
      expect(dateValidator.override(integer)).toEqual(new Date(integer));

      var floating = 8978.809;
      expect(dateValidator.override(floating)).toEqual(new Date(floating));

      var bool = false;
      expect(dateValidator.override(bool)).toEqual(new Date(bool));

      var date = new Date();
      expect(dateValidator.override(date)).toBe(date); // A date object is not overriden

      var obj = {};
      expect(dateValidator.override(obj)).toEqual(new Date()); // Invalid value is overriden to a empty Date object

      var array = [];
      expect(dateValidator.override(array)).toEqual(new Date()); // Invalid value is overriden to a empty Date object
    });
  });
});
