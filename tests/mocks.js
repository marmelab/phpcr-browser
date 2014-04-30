/*global define, jasmine*/
/* jshint indent:2 */

define('mocks', [
    'fixtures',
    'mixins',
    'angular'
  ], function (fixtures, mixins, angular) {
    'use strict';

    var mockServer = function($httpBackend, Config) {
      var repositoriesUrl = mixins.buildUrl([
        Config.api.server,
        Config.api.prefixes.repositories
      ]);

      var repositoryUrl = mixins.buildUrl([
        repositoriesUrl,
        'test'
      ]);

      var workspacesUrl = mixins.buildUrl([
        repositoryUrl,
        Config.api.prefixes.workspaces
      ]);

      var workspaceUrl = mixins.buildUrl([
        workspacesUrl,
        'default'
      ]);

      var nodeUrl = mixins.buildUrl([
        workspaceUrl,
        Config.api.prefixes.nodes
      ]) + '?reducedTree=true';

      var nodeUrlWithoutReducedTree = mixins.buildUrl([
        workspaceUrl,
        Config.api.prefixes.nodes
      ]);

      $httpBackend
        .when('GET', repositoriesUrl)
        .respond(fixtures.repositories);

      $httpBackend
        .when('GET', repositoryUrl)
        .respond(fixtures.repositories[0]);

      $httpBackend
        .when('GET', workspacesUrl)
        .respond(fixtures.workspaces);

      $httpBackend
        .when('GET', workspaceUrl)
        .respond(fixtures.workspaces[0]);

      $httpBackend
        .when('GET', nodeUrl)
        .respond(fixtures.node);

      $httpBackend
        .when('GET', nodeUrlWithoutReducedTree)
        .respond(function() {
          var node = angular.copy(fixtures.node);
          delete node.reducedTree;
          return node;
        });

      $httpBackend
        .when('POST', workspacesUrl)
        .respond('Workspace testWorkspace created');

      $httpBackend
        .when('DELETE', mixins.buildUrl([workspacesUrl, 'testWorkspace']))
        .respond('Workspace testWorkspace deleted');

      $httpBackend
        .when('POST', mixins.buildUrl([nodeUrlWithoutReducedTree, 'testParentNode']))
        .respond('Node testNode created');

      $httpBackend
        .when('DELETE', mixins.buildUrl([nodeUrlWithoutReducedTree, 'testNode']))
        .respond('Node testNode deleted');

      $httpBackend
        .when('PUT', mixins.buildUrl([nodeUrlWithoutReducedTree, 'testNode']) + '?destAbsPath=%2FtestNodeMoved&method=move')
        .respond('Node testNode moved');

      $httpBackend
        .when('PUT', mixins.buildUrl([nodeUrlWithoutReducedTree, 'testNode']) + '?method=rename&newName=testNodeRenamed')
        .respond('Node testNode renamed');

      $httpBackend
        .when('POST', mixins.buildUrl([nodeUrlWithoutReducedTree, 'testNode']) + '@properties')
        .respond('Property pname created');

      $httpBackend
        .when('DELETE', mixins.buildUrl([nodeUrlWithoutReducedTree, 'testNode']) + '@properties/pname')
        .respond('Property pname deleted');
    };

    var getApiFoundationMock = function() {
      return {
        getServer: jasmine.createSpy('getServer').andReturn('localhost'),
        getRepositoriesPrefix: jasmine.createSpy('getRepositoriesPrefix').andReturn('repositories'),
        getWorkspacesPrefix: jasmine.createSpy('getWorkspacesPrefix').andReturn('workspaces'),
        getNodesPrefix: jasmine.createSpy('getNodesPrefix').andReturn('nodes'),
        getRepositories: jasmine.createSpy('getRepositories').andReturn(mixins.buildPromise(fixtures.repositories)),
        getRepository: jasmine.createSpy('getRepository').andReturn(mixins.buildPromise(fixtures.repositories[0])),
        getWorkspaces: jasmine.createSpy('getWorkspaces').andReturn(mixins.buildPromise(fixtures.workspaces)),
        getWorkspace: jasmine.createSpy('getWorkspace').andReturn(mixins.buildPromise(fixtures.workspaces[0])),
        createWorkspace: jasmine.createSpy('createWorkspace').andReturn(mixins.buildPromise()),
        deleteWorkspace: jasmine.createSpy('deleteWorkspace').andReturn(mixins.buildPromise()),
        getNode: jasmine.createSpy('getNode').andReturn(mixins.buildPromise(fixtures.node)),
        createNode: jasmine.createSpy('createNode').andReturn(mixins.buildPromise()),
        deleteNode: jasmine.createSpy('deleteNode').andReturn(mixins.buildPromise()),
        moveNode: jasmine.createSpy('moveNode').andReturn(mixins.buildPromise()),
        renameNode: jasmine.createSpy('renameNode').andReturn(mixins.buildPromise()),
        createNodeProperty: jasmine.createSpy('createNodeProperty').andReturn(mixins.buildPromise()),
        deleteNodeProperty: jasmine.createSpy('deleteNodeProperty').andReturn(mixins.buildPromise()),
        updateNodeProperty: jasmine.createSpy('updateNodeProperty').andReturn(mixins.buildPromise())
      };
    };

    var getRepositoryMock = function() {
      var repository = fixtures.repositories[0];

      return {
        getName: function() { return repository.name; }
      };
    };

    var getWorkspaceMock = function() {
      var workspace = fixtures.workspaces[0];

      return {
        getName: function() { return workspace.name; },
        getRepository: function() { return getRepositoryMock(); }
      };
    };

    var getObjectMapperMock = function() {
      return {
        find: jasmine.createSpy('find').andReturn(fixtures.node)
      };
    };

    var getSmartPropertyMock = function() {
      return {
        build: jasmine.createSpy('build').andCallFake(function(property, node) {
          return {
            getName: jasmine.createSpy('getName').andReturn(property.name),
            getType: jasmine.createSpy('getType').andReturn(property.type),
            setType: jasmine.createSpy('setType').andReturn(mixins.buildPromise()),
            getValue: jasmine.createSpy('getValue').andReturn(mixins.buildPromise(property.value)),
            setValue: jasmine.createSpy('setValue').andReturn(mixins.buildPromise()),
            insert: jasmine.createSpy('insert').andReturn(mixins.buildPromise()),
            update: jasmine.createSpy('update').andReturn(mixins.buildPromise()),
            delete: jasmine.createSpy('delete').andReturn(mixins.buildPromise()),
          };
        }),
        accept: jasmine.createSpy('accept').andReturn(true)
      };
    };

    return {
      mockServer: mockServer,
      getApiFoundationMock: getApiFoundationMock,
      getRepositoryMock: getRepositoryMock,
      getWorkspaceMock: getWorkspaceMock,
      getObjectMapperMock: getObjectMapperMock,
      getSmartPropertyMock: getSmartPropertyMock
    };
  });
