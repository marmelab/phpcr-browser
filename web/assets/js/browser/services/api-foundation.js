/* global define */
/* jshint indent:2 */

define([
  'app',
], function(app) {
  'use strict';
  /**
   * ApiFoundation is the lower layer of the phpcr-browser.
   * It transforms the basic actions in REST requests on the API
   */
  app.provider('mbApiFoundation', function() {
    var server,
        repositoriesPrefix,
        workspacesPrefix,
        nodesPrefix;

    /**
     * Configure server url
     * @param {string} value
     */
    this.setServer = function(value) {
      server = value;
    };

    /**
     * Configure repositories collection prefix in url
     * @param {string} value
     */
    this.setRepositoriesPrefix = function(value) {
      repositoriesPrefix = value;
    };

    /**
     * Configure workspaces collection prefix in url
     * @param {string} value
     */
    this.setWorkspacesPrefix = function(value) {
      workspacesPrefix = value;
    };

    /**
     * Configure nodes collection prefixe in url
     * @param {string} value
     */
    this.setNodesPrefix = function(value) {
      nodesPrefix = value;
    };

    this.$get = ['$q', 'Restangular', function($q, Restangular) {
      Restangular.setBaseUrl(server);

      var repositories    = Restangular.all(repositoriesPrefix);
      var repositoryCache = {};
      var workspaceCache  = {};
      var nodeCache       = {};

      /**
       * Build repository Restangular object and cache it
       * @param  {string} repository
       * @return {Restangular object}
       */
      var repository = function(repository) {
        if (!repositoryCache[repository]) {
          repositoryCache[repository] = Restangular.one(repositoriesPrefix, repository);
        }
        return repositoryCache[repository];
      };

      /**
       * Build workspaces Restangular object
       * @param  {string} repositoryName
       * @return {Restangular object}
       */
      var workspaces = function(repositoryName) {
        return repository(repositoryName).all(workspacesPrefix);
      };

      /**
       * Build workspace Restangular object and cache it
       * @param  {string} repositoryName
       * @param  {string} name
       * @return {Restangular object}
       */
      var workspace = function(repositoryName, name) {
        if (!workspaceCache[repositoryName+'/'+name]) {
          workspaceCache[repositoryName+'/'+name] = repository(repositoryName).one(workspacesPrefix, name);
        }
        return workspaceCache[repositoryName+'/'+name];
      };

      /**
       * Build node Restangular object and cache it
       * @param  {string} repositoryName
       * @param  {string} workspaceName
       * @param  {string} path
       * @return {Restangular object}
       */
      var node = function(repositoryName, workspaceName, path) {
        if (!nodeCache[repositoryName+'/'+workspaceName+path]) {
          if (path.slice(0,1) === '/') {
            path = path.slice(1);
          }
          nodeCache[repositoryName+'/'+workspaceName+path] = workspace(repositoryName, workspaceName).one(nodesPrefix, path);
        }
        return nodeCache[repositoryName+'/'+workspaceName+path];
      };

      /**
       * Build nodes Restangular object
       * @param  {string} repositoryName
       * @param  {string} workspaceName
       * @param  {string} path
       * @return {Restangular object}
       */
      var nodeCollection = function(repositoryName, workspaceName, path) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).all(nodesPrefix).all(path);
      };

      /**
       * Build node properties Restangular object
       * @param  {string} repositoryName
       * @param  {string} workspaceName
       * @param  {string} path
       * @return {Restangular object}
       */
      var nodeProperties = function(repositoryName, workspaceName, path) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).all(nodesPrefix).all(path + '@properties');
      };

      /**
       * Build node property Restangular object
       * @param  {string} repositoryName
       * @param  {string} workspaceName
       * @param  {string} path
       * @param  {string} propertyName
       * @return {Restangular object}
       */
      var nodeProperty = function(repositoryName, workspaceName, path, propertyName) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).all(nodesPrefix).one(path + '@properties', propertyName);
      };

      return {
        /**
         * Get server url
         * @return {string}
         */
        getServer: function() {
          return server;
        },

        /**
         * Get repositories collection prefix
         * @return {string}
         */
        getRepositoriesPrefix: function() {
          return repositoriesPrefix;
        },

        /**
         * Get workspaces collection prefix
         * @return {string}
         */
        getWorkspacesPrefix: function() {
          return workspacesPrefix;
        },

        /**
         * Get nodes collection prefix
         * @return {string}
         */
        getNodesPrefix: function() {
          return nodesPrefix;
        },

        /**
         * Get all repositories
         * @param  {object} config
         * @return {promise}
         */
        getRepositories: function(config) {
          config = config || {};
          return repositories.withHttpConfig(config).getList();
        },

        /**
         * Get a repository
         * @param  {string} name
         * @param  {object} config
         * @return {promise}
         */
        getRepository: function(name, config) {
          config = config || {};
          return repository(name).withHttpConfig(config).get();
        },

        /**
         * Get all workspaces in a repository
         * @param  {string} repositoryName
         * @param  {object} config
         * @return {promise}
         */
        getWorkspaces: function(repositoryName, config) {
          config = config || {};
          return workspaces(repositoryName).withHttpConfig(config).getList();
        },

        /**
         * Get a workspace in a repository
         * @param  {string} repositoryName
         * @param  {string} name
         * @param  {object} config
         * @return {promise}
         */
        getWorkspace: function(repositoryName, name, config) {
          config = config || {};
          return workspace(repositoryName, name).withHttpConfig(config).get();
        },

        /**
         * Create a workspace in a repository
         * @param  {string} repositoryName
         * @param  {string} name
         * @param  {object} config
         * @return {promise}
         */
        createWorkspace: function(repositoryName, name, config) {
          config = config || {};
          return workspaces(repositoryName).withHttpConfig(config).post({ name: name });
        },

        /**
         * Delete a workspace in a repository
         * @param  {string} repositoryName
         * @param  {string} name
         * @param  {object} config
         * @return {promise}
         */
        deleteWorkspace: function(repositoryName, name, config) {
          config = config || {};
          return workspace(repositoryName, name).withHttpConfig(config).remove();
        },

        /**
         * Get a node in a workspace
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {object} config
         * @return {promise}
         */
        getNode: function(repositoryName, workspaceName, path, config) {
          config = config || {};
          var params;
          if (config.reducedTree) {
            params = { reducedTree: true };
            delete config.reducedTree;
          } else{
            params = {};
          }
          return node(repositoryName, workspaceName, path).withHttpConfig(config).get(params);
        },

        /**
         * Create a node in a workspace
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} parentPath
         * @param  {string} relPath
         * @param  {object} config
         * @return {promise}
         */
        createNode: function(repositoryName, workspaceName, parentPath, relPath, config) {
          config = config || {};
          return nodeCollection(repositoryName, workspaceName, parentPath).withHttpConfig(config).post({ relPath: relPath});
        },

        /**
         * Delete a node in a workspace
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {object} config
         * @return {promise}
         */
        deleteNode: function(repositoryName, workspaceName, path, config) {
          config = config || {};
          return node(repositoryName, workspaceName, path).withHttpConfig(config).remove();
        },

        /**
         * Move a node in a workspace
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {string} newPath
         * @param  {object} config
         * @return {promise}
         */
        moveNode: function(repositoryName, workspaceName, path, newPath, config) {
          config = config || {};
          return node(repositoryName, workspaceName, path).withHttpConfig(config).put({
            method:      'move',
            destAbsPath: newPath
          });
        },

        /**
         * Rename a node in a workspace
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {string} newName
         * @param  {object} config
         * @return {promise}
         */
        renameNode: function(repositoryName, workspaceName, path, newName, config) {
          config = config || {};
          return node(repositoryName, workspaceName, path).withHttpConfig(config).put({
            method: 'rename',
            newName: newName
          });
        },

        /**
         * Create a property in a node
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {string} propertyName
         * @param  {mixed} propertyValue
         * @param  {int} propertyType
         * @param  {object} config
         * @return {promise}
         */
        createNodeProperty: function(repositoryName, workspaceName, path, propertyName, propertyValue, propertyType, config) {
          config = config || {};
          if (propertyType) {
            return nodeProperties(repositoryName, workspaceName, path).withHttpConfig(config).post({ name: propertyName, value: propertyValue, type: propertyType });
          }
          return nodeProperties(repositoryName, workspaceName, path).withHttpConfig(config).post({ name: propertyName, value: propertyValue });
        },

        /**
         * Delete a property in a node
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {string} propertyName
         * @param  {object} config
         * @return {promise}
         */
        deleteNodeProperty: function(repositoryName, workspaceName, path, propertyName, config) {
          config = config || {};
          return nodeProperty(repositoryName, workspaceName, path, propertyName).withHttpConfig(config).remove();
        },

        /**
         * Update a property in a node
         * @param  {string} repositoryName
         * @param  {string} workspaceName
         * @param  {string} path
         * @param  {string} propertyName
         * @param  {mixed} propertyValue
         * @param  {int} propertyType
         * @param  {object} config
         * @return {promise}
         */
        updateNodeProperty: function(repositoryName, workspaceName, path, propertyName, propertyValue, propertyType, config) {
          config = config || {};
          return nodeProperties(repositoryName, workspaceName, path).withHttpConfig(config).post({ name: propertyName, value: propertyValue, type: propertyType });
        },
      };
    }];
  });
});
