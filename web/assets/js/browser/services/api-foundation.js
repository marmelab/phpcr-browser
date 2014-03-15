(function(app) {
  'use strict';

  app.provider('mbApiFoundation', function() {
    var server = '/api';
    var repositoriesPrefix = 'repositories';
    var workspacesPrefix = 'workspaces';
    var nodesPrefix = 'nodes';

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
      var repository = function(repository) {
        return Restangular.one(repositoriesPrefix, repository);
      };
      var workspaces = function(repositoryName) {
        return repository(repositoryName).all(workspacesPrefix);
      };
      var workspace = function(repositoryName, name) {
        return repository(repositoryName).one(workspacesPrefix, name);
      };
      var node = function(repositoryName, workspaceName, path) {
        if (path.slice(0,1) === '/') {
          path = path.slice(1);
        }
        return workspace(repositoryName, workspaceName).one(nodesPrefix, path);
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
        getRepositories: function() {
          return repositories.getList();
        },
        getRepository: function(name) {
          return repository(name).get();
        },
        getWorkspaces: function(repositoryName) {
          return workspaces(repositoryName).getList();
        },
        getWorkspace: function(repositoryName, name) {
          return workspace(repositoryName, name).get();
        },
        createWorkspace: function(repositoryName, name) {
          return workspaces(repositoryName).post({ name: name });
        },
        deleteWorkspace: function(repositoryName, name) {
          return workspace(repositoryName, name).remove();
        },
        getNode: function(repositoryName, workspaceName, path) {
          return node(repositoryName, workspaceName, path).get({reducedTree: true});
        },
        createNode: function(repositoryName, workspaceName, parentPath, relPath) {
          node(repositoryName, workspaceName, parentPath).post({ relPath: relPath});
        },
        deleteNode: function(repositoryName, workspaceName, path) {
          return node(repositoryName, workspaceName, path).remove();
        },
        moveNode: function(repositoryName, workspaceName, path, newPath) {
          return node(repositoryName, workspaceName, path).put({
            method: 'move',
            destAbsPath: newPath
          });
        },
        renameNode: function(repositoryName, workspaceName, path, newName) {
          return node(repositoryName, workspaceName, path).put({
            method: 'rename',
            newName: newName
          });
        },
        createNodeProperty: function(repositoryName, workspaceName, path, propertyName, propertyValue, propertyType) {
          if (propertyType) {
            return nodeProperties(repositoryName, workspaceName, path).post({ name: propertyName, value: propertyValue, type: propertyType });
          }
          return nodeProperties(repositoryName, workspaceName, path).post({ name: propertyName, value: propertyValue });
        },
        deleteNodeProperty: function(repositoryName, workspaceName, path, propertyName) {
          return nodeProperty(repositoryName, workspaceName, path, propertyName).remove();
        },
        updateNodeProperty: function(repositoryName, workspaceName, path, propertyName, propertyValue, propertyType) {
          return nodeProperties(repositoryName, workspaceName, path).post({ name: propertyName, value: propertyValue, type: propertyType });
        },
      };
    }];
  });
})(angular.module('browserApp'));