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
      var mutex = 0,
          mutexStack = [];

      /**
       * Get the current repository based on the url
       * @param  {object} params
       * @return {promise}
       */
      this.getCurrentRepository = function(params) {
        var self = this;

        if (mutex > 0) {
          var deferred = $q.defer();
          mutexStack.push({
            deferred: deferred,
            params: params
          });
          return deferred.promise;
        }

        mutex++;

        return ObjectMapper.find('/' + $stateParams.repository, params).then(function(repository) {
          return repository;
        }, function(err) {
          return $q.reject(err);
        }).finally(function() {
          mutex--;
          if (mutexStack.length > 0) {
            var el = mutexStack.shift();
            self.getCurrentRepository(el.params).then(function(repository) {
              el.deferred.resolve(repository);
            }, el.deferred.reject);
          }
        });
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
