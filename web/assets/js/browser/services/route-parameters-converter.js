/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  /**
   * The RouteParametersConverter provides the Repository/Workspace/Node object which match the url.
   */
  app.service('mbRouteParametersConverter', ['$rootScope', '$stateParams', '$q', 'mbObjectMapper',
    function($rootScope, $stateParams, $q, ObjectMapper) {

      /**
       * Get the current repository based on the url
       * @param  {object} params
       * @return {promise}
       */
      this.getCurrentRepository = function(params) {
        return ObjectMapper.find('/' + $stateParams.repository, params);
      };

      /**
       * Get the current workspace based on the url
       * @param  {object} params
       * @return {promise}
       */
      this.getCurrentWorkspace = function(params) {
        var deferred = $q.defer();
        this.getCurrentRepository(params).then(function(repository) {
          repository.getWorkspace($stateParams.workspace, params).then(deferred.resolve, deferred.reject);
        });
        return deferred.promise;
      };

      /**
       * Get the current node based on the url
       * @param  {object} params
       * @return {promise}
       */
      this.getCurrentNode = function(params) {
        return this.getCurrentWorkspace(params).then(function(workspace) {
          var path = ($stateParams.path) ? $stateParams.path : '/';
          return workspace.getNode(path, params);
        });
      };
    }]);
});
