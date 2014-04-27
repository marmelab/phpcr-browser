/* global define */
/* jshint indent:2 */

define([
  'app',
], function(app) {
  'use strict';

  app.provider('mbApiFoundation', function() {
    var server,
        repositoriesPrefix,
        workspacesPrefix,
        nodesPrefix;

    this.setServer = function(value) {
      server = value;
    };

    this.setRepositoriesPrefix = function(value) {
      repositoriesPrefix = value;
    };

    this.setWorkspacesPrefix = function(value) {
      workspacesPrefix = value;
    };

    this.setNodesPrefix = function(value) {
      nodesPrefix = value;
    };

    this.$get = ['$q', 'Restangular', function($q, Restangular) {
      Restangular.setBaseUrl(server);

      var repositories = Restangular.all(repositoriesPrefix);
      var repositoryCache = {};
      var workspaceCache = {};
      var nodeCache = {};

      var repository = function(repository) {
        if (!repositoryCache[repository]) {
          repositoryCache[repository] = Restangular.one(repositoriesPrefix, repository);
        }
        return repositoryCache[repository];
      };
      var workspaces = function(repositoryName) {
        return repository(repositoryName).all(workspacesPrefix);
      };
      var workspace = function(repositoryName, name) {
        if (!workspaceCache[repositoryName+'/'+name]) {
          workspaceCache[repositoryName+'/'+name] = repository(repositoryName).one(workspacesPrefix, name);
        }
        return workspaceCache[repositoryName+'/'+name];
      };

      var node = function(repositoryName, workspaceName, path) {
        if (!nodeCache[repositoryName+'/'+workspaceName+path]) {
          if (path.slice(0,1) === '/') {
            path = path.slice(1);
          }
          nodeCache[repositoryName+'/'+workspaceName+path] = workspace(repositoryName, workspaceName).one(nodesPrefix, path);
        }
        return nodeCache[repositoryName+'/'+workspaceName+path];
      };
      var nodeCollection = function(repositoryName, workspaceName, path) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).all(nodesPrefix).all(path);
      };
      var nodeProperties = function(repositoryName, workspaceName, path) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).all(nodesPrefix).all(path + '@properties');
      };
      var nodeProperty = function(repositoryName, workspaceName, path, propertyName) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).all(nodesPrefix).one(path + '@properties', propertyName);
      };

      return {
        getServer: function() {
          return server;
        },
        getRepositoriesPrefix: function() {
          return repositoriesPrefix;
        },
        getWorkspacesPrefix: function() {
          return workspacesPrefix;
        },
        getNodesPrefix: function() {
          return nodesPrefix;
        },
        getRepositories: function(config) {
          config = config || {};
          return repositories.withHttpConfig(config).getList();
        },
        getRepository: function(name, config) {
          config = config || {};
          return repository(name).withHttpConfig(config).get();
        },
        getWorkspaces: function(repositoryName, config) {
          config = config || {};
          return workspaces(repositoryName).withHttpConfig(config).getList();
        },
        getWorkspace: function(repositoryName, name, config) {
          config = config || {};
          return workspace(repositoryName, name).withHttpConfig(config).get();
        },
        createWorkspace: function(repositoryName, name, config) {
          config = config || {};
          return workspaces(repositoryName).withHttpConfig(config).post({ name: name });
        },
        deleteWorkspace: function(repositoryName, name, config) {
          config = config || {};
          return workspace(repositoryName, name).withHttpConfig(config).remove();
        },
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
        createNode: function(repositoryName, workspaceName, parentPath, relPath, config) {
          config = config || {};
          return nodeCollection(repositoryName, workspaceName, parentPath).withHttpConfig(config).post({ relPath: relPath});
        },
        deleteNode: function(repositoryName, workspaceName, path, config) {
          config = config || {};
          return node(repositoryName, workspaceName, path).withHttpConfig(config).remove();
        },
        moveNode: function(repositoryName, workspaceName, path, newPath, config) {
          config = config || {};
          return node(repositoryName, workspaceName, path).withHttpConfig(config).put({
            method: 'move',
            destAbsPath: newPath
          });
        },
        renameNode: function(repositoryName, workspaceName, path, newName, config) {
          config = config || {};
          return node(repositoryName, workspaceName, path).withHttpConfig(config).put({
            method: 'rename',
            newName: newName
          });
        },
        createNodeProperty: function(repositoryName, workspaceName, path, propertyName, propertyValue, propertyType, config) {
          config = config || {};
          if (propertyType) {
            return nodeProperties(repositoryName, workspaceName, path).withHttpConfig(config).post({ name: propertyName, value: propertyValue, type: propertyType });
          }
          return nodeProperties(repositoryName, workspaceName, path).withHttpConfig(config).post({ name: propertyName, value: propertyValue });
        },
        deleteNodeProperty: function(repositoryName, workspaceName, path, propertyName, config) {
          config = config || {};
          return nodeProperty(repositoryName, workspaceName, path, propertyName).withHttpConfig(config).remove();
        },
        updateNodeProperty: function(repositoryName, workspaceName, path, propertyName, propertyValue, propertyType, config) {
          config = config || {};
          return nodeProperties(repositoryName, workspaceName, path).withHttpConfig(config).post({ name: propertyName, value: propertyValue, type: propertyType });
        },
      };
    }];
  });
});
