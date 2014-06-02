/*global define,describe,it,beforeEach,module,inject,expect, spyOn*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'controllers/repositories'
], function(mocks) {
  'use strict';

  describe('Controller: RepositoriesCtrl', function() {
    var RepositoriesCtrl,
        $location,
        $rootScope,
        $scope,
        repository;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      repository = mocks.getRepositoryMock();
      $location = $injector.get('$location');
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();

      RepositoriesCtrl = $injector.get('$controller')('mbRepositoriesCtrl', {
        '$scope': $scope,
        '$location': $location
      });
    }));

    it('should listen for search.change event', function() {
      $rootScope.$broadcast('search.change', 'test');
      expect($scope.search).toBe('test');
    });

    it('should call $location.path when openRepository is called', function() {
      spyOn($location, 'path');
      $scope.openRepository(repository);
      expect($location.path).toHaveBeenCalledWith('/' + repository.getName());
    });
  });
});
