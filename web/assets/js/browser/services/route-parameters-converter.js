(function(angular, app) {
  'use strict';

  app.service('mbRouteParametersConverter', ['$rootScope', '$routeParams', '$q', 'mbApi',
    function($rootScope, $routeParams, $q, mbApi) {

    var currentRepository = null;

    this.getCurrentRepository = function() {
      var deferred = $q.defer();
      if (currentRepository === null) {
        mbApi.getRepositories().then(function(repositories) {
          angular.forEach(repositories, function(repository) {
            if (repository.getName() === $routeParams.repository) {
              currentRepository = repository;
              return deferred.resolve(repository);
            }
          });
          deferred.reject('Unknown repository');
        });
      } else { deferred.resolve(currentRepository); }
      return deferred.promise;
    };

    this.getCurrentWorkspace = function() {
      return this.getCurrentRepository().then(function(repository) {
        return repository.getWorkspace($routeParams.workspace);
      });
    };

    this.getCurrentNode = function() {
      return this.getCurrentWorkspace().then(function(workspace) {
        return mbApi.getNode(workspace, ($routeParams.path) ? '/' + $routeParams.path : '/');
      });
    };

  }]);
})(angular, angular.module('browserApp'));