(function(angular, app) {
  'use strict';

  app.factory('mbNodeFactory', ['$q', function($q) {
    var proxy = function(parent, children) {
      var result = [];
      angular.forEach(children, function(child) {
        result.push(new Node(child, parent, parent._workspace, parent._cacheResolver));
      });
      return result;
    };

    var Node = function(node, parent, workspace, cacheResolver) {
      this._restangular = node;
      this._parent = parent;
      this._cacheResolver = cacheResolver;
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
      return this.workspace;
    };

    Node.prototype.getParent = function() {
      return this._parent;
    };

    Node.prototype.getChildren = function() {
      var deferred = $q.defer(), self = this;
      if (this._childrenNotCached) {
        this.cacheResolver(this).then(function(children) {
          self._children = proxy(self, children);
          self._childrenNotCached = false;
          deferred.resolve(self._children);
        }).error(deferred.reject);
      } else {
        deferred.resolve(this._children);
      }
      return deferred.promise;
    };

    return {
      build: function(node, workspace, cacheResolver) {
        return new Node(node, null, workspace, cacheResolver);
      },
      accept: function(data) {
        return data.name !== undefined && data.path !== undefined;
      }
    };
  }]);
})(angular, angular.module('browserApp'));