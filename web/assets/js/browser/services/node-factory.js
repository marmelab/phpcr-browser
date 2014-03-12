(function(angular, app) {
  'use strict';

  app.factory('mbNodeFactory', ['$q', 'mbApiFoundation', function($q) {
    var proxy = function(parent, children) {
      var result = [];
      angular.forEach(children, function(child) {
        result.push(new Node(child, parent._workspace, parent._finder));
      });
      return result;
    };

    var Node = function(node, workspace, finder) {
      this._restangular = node;
      this._finder = finder;
      this._children = [];
      this._workspace = workspace;
      this._childrenNotCached = false;
      if (this._restangular.hasChildren && this._restangular.children.length === 0) {
        this._childrenNotCached = true;
      } else {
        this._children = proxy(this, this._restangular.children);
      }
    };

    Node.prototype.getPath = function() {
      return this._restangular.path;
    };

    Node.prototype.getName = function() {
      return this._restangular.name;
    };

    Node.prototype.getWorkspace = function() {
      return this._workspace;
    };

    Node.prototype.getParent = function() {
      var components = this.getPath().split('/');
      components.pop();
      return this._finder('/' + this.getWorkspace().getRepository().getName() + '/' + this.getWorkspace().getName() + '/' + components.join('/'));
    };

    Node.prototype.getProperties = function() {
      return this._restangular.properties;
    };

    Node.prototype.getReducedTree = function() {
      return this._restangular.reducedTree;
    };

    Node.prototype.getChildren = function() {
      var deferred = $q.defer();
      var me = this._finder('/' + this.getWorkspace().getRepository().getName() + '/' + this.getWorkspace().getName() + this.getPath());
      this._restangular = me;
      deferred.resolve(proxy(this, this.restangular.children));
      return deferred.promise;
    };

    return {
      build: function(node, workspace, finder) {
        return new Node(node, workspace, finder);
      },
      accept: function(data) {
        return data.name !== undefined && data.path !== undefined;
      }
    };
  }]);
})(angular, angular.module('browserApp'));