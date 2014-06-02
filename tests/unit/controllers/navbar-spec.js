/*global define,describe,it,beforeEach,module,inject,expect, spyOn*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'controllers/navbar'
], function () {
  'use strict';

  describe('Controller: Navbar', function () {
    var NavbarCtrl,
        $translate,
        Menu,
        $rootScope,
        $scope;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      $translate = $injector.get('$translate');
      Menu = $injector.get('mbMenu');
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();

      NavbarCtrl = $injector.get('$controller')('mbNavbarCtrl', {
        '$scope': $scope,
        '$translate': $translate,
        'mbMenu': Menu
      });
    }));

    it('should broadcast event when $scope.search change', function () {
      var search = null;
      $rootScope.$on('_search.change', function(e, value) {
        search = value;
      });

      $scope.search = 'test';
      $scope.$digest();
      expect(search).toBe('test');

      expect($scope.menu).toEqual(Menu.getMenu());
    });

    it('should append the menu to the $scope', function () {
      $scope.$digest();
      expect($scope.menu).toEqual(Menu.getMenu());

      spyOn(Menu, 'getMenu').andReturn({ test: 'hey!' });
      $scope.$digest();
      expect($scope.menu).toEqual({ test: 'hey!' });
    });

    it('should use $translate for translation actions', function () {
      expect($scope.changeLanguage).toBe($translate.use); // ref equality

      spyOn($translate, 'use');
      $scope.isPreferredLanguage('fr');
      expect($translate.use).toHaveBeenCalledWith();
    });
  });
});
