(function(angular, app) {
  'use strict';

  app.service('mbRouteParametersConverter', ['$rootScope', '$stateParams', '$q', 'mbObjectMapper',
    function($rootScope, $stateParams, $q, ObjectMapper) {
      this.getCurrentRepository = function() {
        return ObjectMapper.find('/' + $stateParams.repository);
      };

      this.getCurrentWorkspace = function() {
        return this.getCurrentRepository().then(function(repository) {
          return repository.getWorkspace($stateParams.workspace);
        });
      };

      this.getCurrentNode = function() {
        return this.getCurrentWorkspace().then(function(workspace) {
          var path = ($stateParams.path) ? $stateParams.path : '/';
          return workspace.getNode(path);
        });
      };
    }]);
})(angular, angular.module('browserApp'));