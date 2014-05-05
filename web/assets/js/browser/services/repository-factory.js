/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.factory('mbRepositoryFactory', function() {

    var Repository = function(repository, finder) {
      this._restangular = repository;
      this._workspaces = [];
      this._finder = finder;
    };

    Repository.prototype.getName = function() {
      return this._restangular.name;
    };

    Repository.prototype.getFactoryName = function() {
      return this._restangular.factoryName;
    };

    Repository.prototype.getSupportedOperations = function() {
      return this._restangular.support;
    };

    Repository.prototype.supports = function(operation) {
      return this.getSupportedOperations().indexOf(operation) !== -1;
    };

    Repository.prototype.getWorkspaces = function(config) {
      return this._finder('/' + this.getName() + '/*', config);
    };

    Repository.prototype.getWorkspace = function(name) {
      return this._finder('/' + this.getName() + '/' + name);
    };

    return {
      build: function(repository, finder) {
        return new Repository(repository, finder);
      },
      accept: function(data) {
        return data.name !== undefined && data.factoryName !== undefined;
      }
    };
  });
});
