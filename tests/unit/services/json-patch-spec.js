/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'services/json-patch'
], function (angular) {
  'use strict';

  describe('Service: JsonPatch', function () {
    var JsonPatch,
        $rootScope,
        result;

    var json =
     {
      name: 'test',
      nested:{
        array: [1,2],
        string: 'test2'
      }
    };

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function ($injector) {
      JsonPatch = $injector.get('mbJsonPatch');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should correctly perform an update in json', function () {
      result = JsonPatch.update(json, '/name', 'updated');
      expect(result.name).toBe('updated');

      result = JsonPatch.update(json, '/nested/array/0', 2);
      expect(result.nested.array[0]).toBe(2);
    });

    it('should correctly perform a delete in json', function () {
      result = JsonPatch.delete(json, '/name');
      expect(result.name).toBe(undefined);

      result = JsonPatch.delete(json, '/nested/array/1', 2);
      expect(result.nested.array[1]).toBe(undefined);
      expect(result.nested.array.length).toBe(1);
    });

    it('should correctly perform an insert in json', function () {
      result = JsonPatch.insert(json, '/name', { first: 'second' });
      expect(result.name.first).toBe('second');
    });

    it('should correctly perform a get in json', function () {
      expect(JsonPatch.get(json, '/name')).toBe('test');
      expect(JsonPatch.get(json, '/nested/array/1')).toBe(2);
      expect(JsonPatch.get(json, '/nested/string')).toBe('test2');
    });
  });
});
