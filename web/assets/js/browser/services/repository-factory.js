/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  /**
   * RepositoryFactory is a factory to build Repository object with the raw data returned by the REST API.
   */
  app.factory('mbRepositoryFactory', function() {

    /**
     * Repository constructor
     * @param {object} repository
     * @param {Function} finder
     */
    var Repository = function(repository, finder) {
      this._restangular = repository;
      this._workspaces = [];
      this._finder = finder;
    };

    /**
     * Get the name of the repository
     * @return {string}
     */
    Repository.prototype.getName = function() {
      return this._restangular.name;
    };

    /**
     * Get the factory name of the repository
     * @return {string}
     */
    Repository.prototype.getFactoryName = function() {
      return this._restangular.factoryName;
    };

    /**
     * Get the list of operations supported by the repository
     * @return {array}
     */
    Repository.prototype.getSupportedOperations = function() {
      return this._restangular.support;
    };

    /**
     * Test if the repository supports an operation
     * @param  {string} operation
     * @return {boolean}
     */
    Repository.prototype.supports = function(operation) {
      return this.getSupportedOperations().indexOf(operation) !== -1;
    };

    /**
     * Get all workspaces of the epository
     * @param  {object} config
     * @return {promise}
     */
    Repository.prototype.getWorkspaces = function(config) {
      return this._finder('/' + this.getName() + '/*', config);
    };

    /**
     * Get a workspace of the repository
     * @param  {string} name
     * @return {promise}
     */
    Repository.prototype.getWorkspace = function(name) {
      return this._finder('/' + this.getName() + '/' + name);
    };

    return {

      /**
       * Build a Repository object
       * @param  {object} repository
       * @param  {Function} finder
       * @return {Repository}
       */
      build: function(repository, finder) {
        return new Repository(repository, finder);
      },

      /**
       * Test raw data validity
       * @param  {object} data
       * @return {boolean}
       */
      accept: function(data) {
        return data.name !== undefined && data.factoryName !== undefined;
      }
    };
  });
});
