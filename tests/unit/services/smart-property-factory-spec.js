/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'services/smart-property-factory'
], function (mocks, angular) {
  'use strict';

  describe('Service: SmartPropertyFactoryFactory', function () {
    var SmartPropertyFactory,
        JsonPatch,
        node,
        propertyData = { name: 'property', value: { nested: 'string', array: [0, 4] }, type: 'composite' },
        $rootScope;

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      JsonPatch = mocks.getJsonPatchMock();
      node =  mocks.getNodeMock();

      module(function ($provide) {
        $provide.value('mbJsonPatch', JsonPatch);
      });
    });

    beforeEach(inject(function ($injector) {
      SmartPropertyFactory = $injector.get('mbSmartPropertyFactory');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should accept only valid data', function () {
      expect(SmartPropertyFactory.accept(propertyData)).toBe(true);
      expect(SmartPropertyFactory.accept({ name: 'property' })).toBe(false);
    });

    it('should return smart propery data with getter', function () {
      var property = SmartPropertyFactory.build(propertyData, node);
      expect(property.getName()).toBe(propertyData.name);
      expect(property.getType()).toBe(propertyData.type);

      property.getValue().then(function(value) {
        expect(value).toBe(propertyData.value);
      });
      $rootScope.$apply();

      property.getValue('/nested');
      $rootScope.$apply();

      expect(JsonPatch.get).toHaveBeenCalledWith(propertyData.value, '/nested');
    });

    it('should call setProperty on node when setType is called', function () {
      var property = SmartPropertyFactory.build(angular.copy(propertyData), node);
      property.setType('mixed');
      $rootScope.$apply();

      expect(node.setProperty).toHaveBeenCalledWith(
        propertyData.name,
        propertyData.value,
        'mixed'
      );
    });

    it('should call setProperty on node when setValue is called', function () {
      var property = SmartPropertyFactory.build(angular.copy(propertyData), node);
      property.setValue('new');
      $rootScope.$apply();

      expect(node.setProperty).toHaveBeenCalledWith(
        propertyData.name,
        'new',
        propertyData.type
      );
    });

    it('should call insert on JsonPatch when insert is called', function () {
      var property = SmartPropertyFactory.build(angular.copy(propertyData), node);
      property.insert('/nested', { v: 'new' });
      $rootScope.$apply();

      expect(JsonPatch.insert).toHaveBeenCalledWith(
        propertyData.value,
        '/nested',
        { v: 'new' }
      );
    });

    it('should call update on JsonPatch when update is called', function () {
      var property = SmartPropertyFactory.build(angular.copy(propertyData), node);
      property.update('/nested', 'updated');
      $rootScope.$apply();

      expect(JsonPatch.update).toHaveBeenCalledWith(
        propertyData.value,
        '/nested',
        'updated'
      );
    });

    it('should call delete on JsonPatch when delete is called', function () {
      var property = SmartPropertyFactory.build(angular.copy(propertyData), node);
      property.delete('/nested');
      $rootScope.$apply();

      expect(JsonPatch.delete).toHaveBeenCalledWith(
        propertyData.value,
        '/nested'
      );
    });
  });
});
