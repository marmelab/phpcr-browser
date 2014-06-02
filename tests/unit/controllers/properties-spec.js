/*global define,describe,it,beforeEach,module,inject,expect,spyOn,jasmine*/
/* jshint indent:2 */

define([
  'mocks',
  'mixins',
  'angular',
  'angularMocks',
  'app',
  'controllers/properties'
], function(mocks, mixins) {
  'use strict';

  describe('Controller: PropertiesCtrl', function() {
    var PropertiesCtrl,
        $log,
        $filter,
        $timeout,
        $location,
        $translate,
        Config,
        $rootScope,
        $scope,
        repository;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      repository = mocks.getRepositoryMock();
      $log = $injector.get('$log');
      $filter = $injector.get('$filter');
      $timeout = $injector.get('$timeout');
      $location = $injector.get('$location');
      $translate = jasmine.createSpy('$translate').andCallFake($injector.get('$translate'));
      Config = $injector.get('mbConfig');
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();

      $scope.currentNode = mocks.getNodeMock();

      PropertiesCtrl = $injector.get('$controller')('mbPropertiesCtrl', {
        '$scope': $scope,
        '$log': $log,
        '$filter': $filter,
        '$timeout': $timeout,
        '$location': $location,
        '$translate': $translate,
        'mbConfig': Config
      });
      $scope.$digest(); // to run the watch on currentNode;
    }));

    it('should listen for search.change event', function() {
      $rootScope.$broadcast('search.change', 'test');
      expect($scope.search).toBe('test');
    });

    it('should call $location.path when openRepository is called', function() {
      expect($scope.displayCreateForm).toBe(false);
      expect($scope.newProperty).toEqual({});
      expect($scope.types).toEqual(Config.node.property.types);
      expect($scope.backup).toBe(null);
    });

    it('should execute all loaders', function() {
      // metadata
      expect($scope.currentNode.getWorkspace().getRepository().supports).toHaveBeenCalledWith('node.property.delete');

      // breadcrumb
      var components = $scope.currentNode.getPath() !== '/' ? $scope.currentNode.getPath().split('/') : [];
      components.shift();
      expect($scope.breadcrumb).toEqual(components);

      // properties
      expect($scope.properties).toEqual([
        {
          name : '0',
          value : [
            {
              name : '0',
              value : 'rep:AccessControllable',
              path : '/0',
              type : 7,
              parentName : '0'
            }
          ],
          type : 7,
          path : '/'
        }
      ]); // This is not the real output but as the SmartPropertyMock is a simple object (typeof do not return `SmartProperty`) it produces this
    });

    it('should call $scope.createProperty when $scope.keyBinding.createForm.keypress.enter() is called', function() {
      spyOn($scope, 'createProperty').andCallThrough();
      $scope.newProperty = {
        name: 'test',
        value: 'val',
        type: {
          label: 'hey',
          value: 98
        }
      };
      $scope.keyBinding.createForm.keypress.enter();
      expect($scope.createProperty).toHaveBeenCalledWith('test', 'val', 98);
      expect($scope.newProperty).toEqual({});

      // Test for type default value
      $scope.newProperty = {
        name: 'test',
        value: 'val'
      };
      $scope.keyBinding.createForm.keypress.enter();
      expect($scope.createProperty).toHaveBeenCalledWith('test', 'val', 0);
    });

    it('should call $scope.toggleCreateForm when $scope.keyBinding.createForm.keydown.esc() is called', function() {
      spyOn($scope, 'toggleCreateForm');
      $scope.keyBinding.createForm.keydown.esc();
      expect($scope.toggleCreateForm).toHaveBeenCalled();
      expect($scope.toggleCreateForm.calls.length).toBe(1);
    });

    it('should call $scope.currentNode.createProperty when $scope.createProperty is called', function() {
      $scope.createProperty('test', 'val', 0);
      expect($scope.currentNode.createProperty).toHaveBeenCalledWith('test', 'val', 0);

      expect($translate).toHaveBeenCalledWith('NODE_ADD_PROPERTY_SUCCESS');
      expect($scope.newProperty).toEqual({});
      expect($scope.displayCreateForm).toBe(false);
    });

    it('should call property.insert when $scope.createProperty is called with a path', function() {
      $scope.createProperty('test', 'val', 0, '/mypath');
      expect($scope.currentNode.getSmartPropertyMock().insert).toHaveBeenCalledWith('', { test: 'val' });
      expect($translate).toHaveBeenCalledWith('NODE_ADD_PROPERTY_SUCCESS');
    });

    it('should set displayCreateForm to !displayCreateForm when $scope.toggleCreateForm is called', function() {
      expect($scope.displayCreateForm).toBe(false);
      $scope.toggleCreateForm();
      expect($scope.displayCreateForm).toBe(true);
      $scope.toggleCreateForm();
      expect($scope.displayCreateForm).toBe(false);
    });

    it('should return label of a type if it exists, undefined otherwise', function() {
      for (var i in Config.node.property.types) {
        expect($scope.typeLabel(i)).toBe(Config.node.property.types[i].name);
      }

      expect($scope.typeLabel(-9999)).toBe('undefined');
    });

    it('should call property.delete when $scope.deleteProperty is called', function() {
      $scope.deleteProperty(0, '/');
      expect($scope.currentNode.getSmartPropertyMock().getValue).toHaveBeenCalledWith('/');
      expect($scope.currentNode.getSmartPropertyMock().delete).toHaveBeenCalledWith('/');
      expect($translate).toHaveBeenCalledWith('NODE_DELETE_PROPERTY_SUCCESS');
    });

    it('should save the deleted property and set a timeout when $scope.deleteProperty is called', function() {
      $scope.deleteProperty(0, '/');
      expect($scope.backup.name).toBe(0);
      expect($scope.backup.value).toEqual(['rep:AccessControllable']);
      $timeout.flush();
      expect($scope.backup).toBe(null);
    });

    it('should call $scope.createProperty when $scope.restoreProperty is called', function() {
      spyOn($scope, 'createProperty').andReturn(mixins.buildPromise({}));
      $scope.backup = {
        name: 'test',
        value: 'val',
        type: 0
      };
      $scope.restoreProperty();
      expect($scope.createProperty).toHaveBeenCalledWith('test', 'val', 0);
    });

    it('should call property.udpate when $scope.updateProperty is called', function() {
      $scope.updateProperty(0, 'val', '/mypath');
      expect($scope.currentNode.getSmartPropertyMock().update).toHaveBeenCalledWith('/mypath', 'val');
      expect($translate).toHaveBeenCalledWith('NODE_UPDATE_PROPERTY_SUCCESS');
    });

    it('should call property.setType when $scope.updatePropertyType is called', function() {
      $scope.updatePropertyType(0, 1);
      expect($scope.currentNode.getSmartPropertyMock().setType).toHaveBeenCalledWith(1);
      expect($translate).toHaveBeenCalledWith('NODE_UPDATE_PROPERTY_SUCCESS');
    });

    it('should return attach typeof to $scope', function() {
      expect($scope.typeof('test')).toBe(typeof('test'));
      expect($scope.typeof(['test'])).toBe(typeof(['test']));
      expect($scope.typeof({ a: 'b' })).toBe(typeof({ a: 'b' }));
    });

    it('should call $scope.deleteProperty when drop.delete event is broadcasted and element is a property', function() {
      spyOn($scope, 'deleteProperty');
      var elementFactory = function(elementClass) {
        return {
          hasClass: function(c) {
            return c === elementClass;
          },
          data: function() {
            return 'test';
          }
        };
      };

      $rootScope.$broadcast('drop.delete', elementFactory('not a property'));
      expect($scope.deleteProperty).not.toHaveBeenCalled();

      $rootScope.$broadcast('drop.delete', elementFactory('property-item'));
      expect($scope.deleteProperty).toHaveBeenCalledWith('test');
    });
  });
});
