/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'fixtures',
  'mixins',
  'mocks',
  'angularMocks',
  'app',
  'services/api-foundation'
], function (fixtures, mixins, mocks) {
  'use strict';

  describe('Service: ApiFoundation', function () {
    var ApiFoundation,
        Config,
        $httpBackend,
        repositoriesUrl,
        repositoryUrl,
        workspacesUrl,
        workspaceUrl,
        nodeUrl,
        nodeUrlWithoutReducedTree,
        nodePropertiesUrl,
        repositoryName = 'test',
        workspaceName = 'default',
        nodeName = 'testNode',
        nodePath = '/' + nodeName;

    // load the service's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function ($injector) {
      ApiFoundation = $injector.get('mbApiFoundation');
      Config = $injector.get('mbConfig');

      repositoriesUrl = mixins.buildUrl([
        Config.api.server,
        Config.api.prefixes.repositories
      ]);

      repositoryUrl = mixins.buildUrl([
        repositoriesUrl,
        repositoryName
      ]);

      workspacesUrl = mixins.buildUrl([
        repositoryUrl,
        Config.api.prefixes.workspaces
      ]);

      workspaceUrl = mixins.buildUrl([
        workspacesUrl,
        workspaceName
      ]);

      nodeUrl = mixins.buildUrl([
        workspaceUrl,
        Config.api.prefixes.nodes
      ]) + '?reducedTree=true';

      nodeUrlWithoutReducedTree = mixins.buildUrl([
        workspaceUrl,
        Config.api.prefixes.nodes
      ]);

      nodePropertiesUrl = mixins.buildUrl([
        nodeUrlWithoutReducedTree,
        nodeName
      ]) + '@properties';

      $httpBackend = $injector.get('$httpBackend');

      mocks.mockServer($httpBackend, Config);
    }));

    it('should be configured with config.js', function () {
      expect(ApiFoundation.getServer()).toBe(Config.api.server);
      expect(ApiFoundation.getRepositoriesPrefix()).toBe(Config.api.prefixes.repositories);
      expect(ApiFoundation.getWorkspacesPrefix()).toBe(Config.api.prefixes.workspaces);
      expect(ApiFoundation.getNodesPrefix()).toBe(Config.api.prefixes.nodes);
    });

    it('should call the configured url when getRepositories is called', function () {
      $httpBackend.expectGET(repositoriesUrl);

      ApiFoundation.getRepositories().then(function(response) {
        var serverRepositories = [{
          name: response[0].name,
          factoryName: response[0].factoryName,
          support: response[0].support
        }];

        expect(serverRepositories).toEqual(fixtures.repositories);
      });

      $httpBackend.flush();
    });

    it('should call the configured url when getRepository is called', function () {
      $httpBackend.expectGET(repositoryUrl);

      ApiFoundation.getRepository(repositoryName).then(function(response) {
        var serverRepository = {
          name: response.name,
          factoryName: response.factoryName,
          support: response.support
        };

        expect(serverRepository).toEqual(fixtures.repositories[0]);
      });
      $httpBackend.flush();
    });

    it('should call the configured url when getWorkspaces is called', function () {
      $httpBackend.expectGET(workspacesUrl);

      ApiFoundation.getWorkspaces(repositoryName).then(function(response) {
        var serverWorkspaces = [
          {
            name: response[0].name
          },
          {
            name: response[1].name
          }
        ];

        expect(serverWorkspaces).toEqual(fixtures.workspaces);
      });
      $httpBackend.flush();
    });

    it('should call the configured url when getWorkspace is called', function () {
      $httpBackend.expectGET(workspaceUrl);

      ApiFoundation.getWorkspace(repositoryName, workspaceName).then(function(response) {
        var serverWorkspace = {
          name: response.name
        };

        expect(serverWorkspace).toEqual(fixtures.workspaces[0]);
      });
      $httpBackend.flush();
    });

    it('should call the configured url when getNode is called', function () {
      $httpBackend.expectGET(nodeUrl);

      ApiFoundation.getNode(repositoryName, workspaceName, '/', { reducedTree: true }).then(function(response) {
        var serverNode = {
          reducedTree: response.reducedTree,
          name: response.name,
          path: response.path,
          repository: response.repository,
          workspace: response.workspace,
          children: response.children,
          hasChildren: response.hasChildren,
          properties: response.properties
        };

        expect(serverNode).toEqual(fixtures.node);
      });

      $httpBackend.expectGET(nodeUrlWithoutReducedTree);

      ApiFoundation.getNode(repositoryName, workspaceName, '/').then(function(response) {
        expect(response.reduceTree).toBe(undefined);
      });

      $httpBackend.flush();
    });

    it('should call the configured url when createWorkspace is called', function () {
      var workspaceName = 'testWorkspace';
      $httpBackend.expectPOST(workspacesUrl, { name: workspaceName });

      ApiFoundation.createWorkspace(repositoryName, workspaceName).then(function(response) {
        expect(response).toBe('Workspace ' + workspaceName + ' created');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when deleteWorkspace is called', function () {
      var workspaceName = 'testWorkspace';
      $httpBackend.expectDELETE(mixins.buildUrl([workspacesUrl, 'testWorkspace']));

      ApiFoundation.deleteWorkspace(repositoryName, workspaceName).then(function(response) {
        expect(response).toBe('Workspace ' + workspaceName + ' deleted');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when createNode is called', function () {
      var nodeParentName = 'testParentNode';
      $httpBackend.expectPOST(mixins.buildUrl([nodeUrlWithoutReducedTree, nodeParentName]), { relPath: nodePath });

      ApiFoundation.createNode(repositoryName, workspaceName, nodeParentName, nodePath).then(function(response) {
        expect(response).toBe('Node ' + nodeName + ' created');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when deleteNode is called', function () {
      $httpBackend.expectDELETE(mixins.buildUrl([nodeUrlWithoutReducedTree, nodeName]));

      ApiFoundation.deleteNode(repositoryName, workspaceName, nodePath).then(function(response) {
        expect(response).toBe('Node ' + nodeName + ' deleted');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when moveNode is called', function () {
      var nodeNewPath = '/testNodeMoved';
      $httpBackend.expectPUT(mixins.buildUrl([nodeUrlWithoutReducedTree, nodeName]) + '?destAbsPath=' + nodeNewPath.replace('/', '%2F') + '&method=move');

      ApiFoundation.moveNode(repositoryName, workspaceName, nodePath, nodeNewPath).then(function(response) {
        expect(response).toBe('Node ' + nodeName + ' moved');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when renameNode is called', function () {
      var nodeNewName = 'testNodeRenamed';
      $httpBackend.expectPUT(mixins.buildUrl([nodeUrlWithoutReducedTree, nodeName]) + '?method=rename&newName=' + nodeNewName);

      ApiFoundation.renameNode(repositoryName, workspaceName, nodePath, nodeNewName).then(function(response) {
        expect(response).toBe('Node ' + nodeName + ' renamed');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when createNodeProperty is called', function () {
      var propertyName = 'pname',
          propertyValue = 'pvalue',
          propertyType = 'undefined';
      $httpBackend.expectPOST(nodePropertiesUrl, { name: propertyName, value: propertyValue, type: propertyType });

      ApiFoundation.createNodeProperty(
        repositoryName,
        workspaceName,
        nodePath,
        propertyName,
        propertyValue,
        propertyType
      ).then(function(response) {
        expect(response).toBe('Property ' + propertyName + ' created');
      });
      $httpBackend.flush();
    });

    it('should call the configured url when deleteNodeProperty is called', function () {
      var propertyName = 'pname';
      $httpBackend.expectDELETE(mixins.buildUrl([nodePropertiesUrl, propertyName]));

      ApiFoundation.deleteNodeProperty(
        repositoryName,
        workspaceName,
        nodePath,
        propertyName
      ).then(function(response) {
        expect(response).toBe('Property ' + propertyName + ' deleted');
      });
      $httpBackend.flush();
    });

    // No test for updatePropertyNode because it is the same as createNodeProperty (POST request)
  });
});
