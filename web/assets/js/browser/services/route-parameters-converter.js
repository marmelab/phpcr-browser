(function(angular, app) {
  'use strict';

  app.service('mbRouteParametersConverter', ['$rootScope', '$stateParams', '$q', 'mbApi',
    function($rootScope, $stateParams, $q, mbApi) {
      this.getCurrentRepository = function() {
        var deferred = $q.defer();
        mbApi.getRepositories().then(function(repositories) {
          angular.forEach(repositories, function(repository) {
            if (repository.getName() === $stateParams.repository) {
              return deferred.resolve(repository);
            }
          });
          deferred.reject('Unknown repository');
        });
        return deferred.promise;
      };

      this.getCurrentWorkspace = function() {
        return this.getCurrentRepository().then(function(repository) {
          return repository.getWorkspace($stateParams.workspace);
        });
      };

      this.getCurrentNode = function() {
        return this.getCurrentWorkspace().then(function(workspace) {
          return mbApi.getNode(workspace, ($stateParams.path) ? '/' + $stateParams.path : '/');
        });
      };
    }]);
})(angular, angular.module('browserApp'));