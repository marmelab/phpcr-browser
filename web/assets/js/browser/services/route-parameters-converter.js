/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  'services/route-parameters-converter'
], function(app) {
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

      this.getCurrentNode = function(reducedTree) {
        return this.getCurrentWorkspace().then(function(workspace) {
          var path = ($stateParams.path) ? $stateParams.path : '/';
          return workspace.getNode(path, reducedTree);
        });
      };
    }]);
});
