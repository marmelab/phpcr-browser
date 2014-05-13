/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/api-foundation',
  'services/smart-property'
], function(app, angular) {
  'use strict';

  /**
   * NodeFactory is a factory to build Node object with the raw data returned by the REST API.
   */
  app.factory('mbNodeFactory', ['$q', 'mbApiFoundation', 'mbSmartProperty', function($q, ApiFoundation, SmartProperty) {

    /**
     * Create a Node object for each child of a node
     * @param  {Node} parent
     * @param  {array} children
     * @return {array}
     */
    var proxy = function(parent, children) {
      var result = [];
      angular.forEach(children, function(child) {
        result.push(new Node(child, parent._workspace, parent._finder));
      });
      return result;
    };

    /**
     * Node constructor
     * @param {object} node
     * @param {Workspace} workspace
     * @param {Function} finder
     */
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

      this._properties = {};
      for (var p in this._restangular.properties) {
        this._restangular.properties[p].name = p;
        if (SmartProperty.accept(this._restangular.properties[p])) {
          this._properties[p] = SmartProperty.build(this._restangular.properties[p], this);
        }
      }
    };

    /**
     * Get the path of the node
     * @return {sring}
     */
    Node.prototype.getPath = function() {
      return this._restangular.path;
    };

    /**
     * Get the name of the node
     * @return {string}
     */
    Node.prototype.getName = function() {
      return this._restangular.name;
    };

    /**
     * Get the workspace of the node
     * @return {Workspace}
     */
    Node.prototype.getWorkspace = function() {
      return this._workspace;
    };

    /**
     * Get the parent of the node
     * @return {promise}
     */
    Node.prototype.getParent = function() {
      var components = this.getPath().split('/');
      components.pop();
      components.shift();
      return this._finder('/' + this.getWorkspace().getRepository().getName() + '/' + this.getWorkspace().getName() + '/' + components.join('/'));
    };

    /**
     * Get all properties of the node
     * @param  {boolean} cache
     * @return {promise}
     */
    Node.prototype.getProperties = function(cache) {
      var self = this;
      if (cache === undefined || cache === true) {
        return $q.when(this._properties);
      }

      return ApiFoundation.getNode(
        this.getWorkspace().getRepository().getName(),
        this.getWorkspace().getName(),
        this.getPath(),
        {cache: false})
      .then(function(node) {
        self._properties = {};
        for (var p in node.properties) {
          node.properties[p].name = p;
          if (SmartProperty.accept(node.properties[p])) {
            self._properties[p] = SmartProperty.build(node.properties[p], self);
          }
        }
        return self._properties;
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Set a property of the node
     * @param {string} name
     * @param {mixed} value
     * @param {int} type
     * @return {promise}
     */
    Node.prototype.setProperty = function(name, value, type) {
      var self = this;
      return this.getProperties().then(function(properties) {
        if (properties[name] === undefined) {
          return $q.reject('Unknown property');
        }
        try {
          value = (typeof(value) === 'object') ? JSON.stringify(value) : value;
        } catch (e) {}

        return ApiFoundation.updateNodeProperty(
          self.getWorkspace().getRepository().getName(),
          self.getWorkspace().getName(),
          self.getPath(),
          name,
          value,
          type,
          {cache: false});
      });
    };

    /**
     * Delete a property of the node
     * @param  {string} name
     * @return {promise}
     */
    Node.prototype.deleteProperty = function(name) {
      var self = this;

      return ApiFoundation.deleteNodeProperty(
        this.getWorkspace().getRepository().getName(),
        this.getWorkspace().getName(),
        this.getPath(),
        name,
        {cache: false})
      .then(function(data) {
        delete self._properties[name];
        return data;
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Create a property in the node
     * @param  {string} name
     * @param  {miwed} value
     * @param  {int} type
     * @return {promise}
     */
    Node.prototype.createProperty = function(name, value, type) {
      var self = this;
      return ApiFoundation.createNodeProperty(
        this.getWorkspace().getRepository().getName(),
        this.getWorkspace().getName(),
        this.getPath(),
        name,
        value,
        type,
        {cache: false})
      .then(function(data) {
        self._properties[name] = SmartProperty.build({ name: name, value: value, type: type }, self);
        return data;
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Get the reduced tree of the node
     * @return {object}
     */
    Node.prototype.getReducedTree = function() {
      return this._restangular.reducedTree;
    };

    /**
     * Get the children of the node
     * @return {promise}
     */
    Node.prototype.getChildren = function() {
      var self = this;
      return this._finder('/' + this.getWorkspace().getRepository().getName() + '/' + this.getWorkspace().getName() + this.getPath()).then(function(me) {
        self._restangular = me;
        return proxy(self, self._restangular.children);
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Get the raw data of the node returned by Restangular
     * @return {object}
     */
    Node.prototype.getRawData = function() {
      return this._restangular;
    };

    /**
     * Get the slug of the node
     * @return {string}
     */
    Node.prototype.getSlug = function() {
      return this.getPath().split('/').join('_');
    };

    /**
     * Delete this node
     * @return {promise}
     */
    Node.prototype.delete = function() {
      return ApiFoundation.deleteNode(this.getWorkspace().getRepository().getName(), this.getWorkspace().getName(), this.getPath(), {cache: false});
    };

    /**
     * Move this node
     * @param  {string} path
     * @return {promise}
     */
    Node.prototype.move = function(path) {
      if (path !== '/') {
        return ApiFoundation.moveNode(this.getWorkspace().getRepository().getName(), this.getWorkspace().getName(), this.getPath(), path + '/' + this.getName(), {cache: false});
      } else {
        return ApiFoundation.moveNode(this.getWorkspace().getRepository().getName(), this.getWorkspace().getName(), this.getPath(), path + this.getName(), {cache: false});
      }
    };

    /**
     * Create this node
     * @return {promise}
     */
    Node.prototype.create = function() {
      var parentPath = this.getPath();
      parentPath = parentPath.split('/');
      parentPath.pop();
      parentPath = parentPath.join('/');

      return ApiFoundation.createNode(
        this.getWorkspace().getRepository().getName(),
        this.getWorkspace().getName(),
        parentPath,
        this.getName()
      );
    };

    /**
     * Has this node some children ?
     * @return {Boolean}
     */
    Node.prototype.hasChildren = function() {
      return this._restangular.hasChildren;
    };

    /**
     * Get the full path of the node (with the repository/workspace name)
     * @return {string}
     */
    Node.prototype.getFullPath = function() {
      return this.getWorkspace().getRepository().getName() + '/' + this.getWorkspace().getName() + this.getPath();
    };

    return {

      /**
       * Build a Node object
       * @param  {object} node
       * @param  {Workspace} workspace
       * @param  {Function} finder
       * @return {Node}
       */
      build: function(node, workspace, finder) {
        return new Node(node, workspace, finder);
      },

      /**
       * Test raw data validity
       * @param  {object} data
       * @return {boolean}
       */
      accept: function(data) {
        return data.name !== undefined && data.path !== undefined;
      }
    };
  }]);
});
