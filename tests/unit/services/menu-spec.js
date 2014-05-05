/*global define,describe,it,beforeEach,module,inject,expect,spyOn,jasmine*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'services/menu'
], function () {
  'use strict';

  describe('Service: Menu', function () {
    var Menu,
        $rootScope,
        dependencyLevel;

    var builders = {
      first: jasmine.createSpy('first').andCallFake(function(callback) {
        dependencyLevel += 5;
        return callback({
          label: 'First link',
          class: 'item',
          sublinks: []
        });
      }),
      second: ['first', jasmine.createSpy('second').andCallFake(function(callback) {
        dependencyLevel *= 2;
        return callback({
          label: 'Second link',
          class: 'item',
          sublinks: []
        });
      })]
    };

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function ($injector) {
      Menu = $injector.get('mbMenu');
      $rootScope = $injector.get('$rootScope');

      Menu.appendBuilder({
        name: 'first',
        builder: builders.first
      });

      Menu.appendBuilder({
        name: 'second',
        builder: builders.second
      });

      dependencyLevel = 1;
    }));

    it('should run builders on $stateChangeSuccess', function () {
      $rootScope.$broadcast('$stateChangeSuccess', { name: 'first' }, [], {}, []);
      expect(builders.first).toHaveBeenCalled();
    });

    it('should run builders and their dependencies', function () {
      $rootScope.$broadcast('$stateChangeSuccess', { name: 'second' }, [], {}, []);
      expect(builders.first).toHaveBeenCalled();
      expect(builders.second[1]).toHaveBeenCalled();
      expect(dependencyLevel).toBe(12); // Check call order
    });

    it('should compile menu based on builders', function () {
      $rootScope.$broadcast('$stateChangeSuccess', { name: 'second' }, [], {}, []);
      expect(Menu.getMenu()).toEqual({
        first: {
          label: 'First link',
          class: 'item',
          sublinks: []
        },
        second: {
          label: 'Second link',
          class: 'item',
          sublinks: []
        }
      });
    });
  });
});
