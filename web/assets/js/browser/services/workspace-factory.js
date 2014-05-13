/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/api-foundation'
], function(app) {
  'use strict';

  app.factory('mbWorkspaceFactory', ['$q', 'mbApiFoundation', function($q, ApiFoundation) {

    /**
     * Workspace constructor
     * @param {object} workspace
     * @param {Repository} repository
     * @param {Function} finder
     */
    var Workspace = function(workspace, repository, finder) {
      this._restangular = workspace;
      this._repository = repository;
      this._finder = finder;
    };

    /**
     * Get the name of the workspace
     * @return {string}
     */
    Workspace.prototype.getName = function() {
      return this._restangular.name;
    };

    /**
     * Get the repository of the workspace
     * @return {Repository}
     */
    Workspace.prototype.getRepository = function() {
      return this._repository;
    };

    /**
     * Get a node in the workspace
     * @param  {string} path
     * @param  {object} params
     * @return {promise}
     */
    Workspace.prototype.getNode = function(path, params) {
      if (!path) { path = '/'; }
      return this._finder('/' + this.getRepository().getName() + '/' + this.getName() + path, params);
    };

    /**
     * Get the slug of the workspace
     * @return {string}
     */
    Workspace.prototype.getSlug = function() {
      return this.getName().replace(' ', '_');
    };

    /**
     * Delete this workspace
     * @return {promise}
     */
    Workspace.prototype.delete = function() {
      return ApiFoundation.deleteWorkspace(this.getRepository().getName(), this.getName());
    };

    /**
     * Create this workspace
     * @return {promise}
     */
    Workspace.prototype.create = function() {
      if (/^[a-zA-z][0-9a-zA-z]*$/.test(this.getName())) {
        return ApiFoundation.createWorkspace(this.getRepository().getName(), this.getName());
      }

      var deferred = $q.defer();
      deferred.reject('The name is not valid');
      return deferred.promise;
    };

    return {

      /**
       * Build a Workspace object
       * @param  {object} workspace
       * @param  {Repository} repository
       * @param  {Function} finder
       * @return {Workspace}
       */
      build: function(workspace, repository, finder) {
        return new Workspace(workspace, repository, finder);
      },

      /**
       * Test raw data validity
       * @param  {object} data
       * @return {boolean}
       */
      accept: function(data) {
        return data.name !== undefined;
      }
    };
  }]);
});
