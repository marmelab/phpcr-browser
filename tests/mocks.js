/*global define, jasmine*/
/* jshint indent:2 */

define('mocks', [
    'fixtures',
    'mixins',
    'angular'
  ], function (fixtures, mixins, angular) {
    'use strict';
    var mockServer,
        getApiFoundationMock,
        getRepositoryMock,
        getWorkspaceMock,
        getNodeMock,
        getObjectMapperMock,
        getSmartPropertyFactoryMock,
        getJsonPatchMock,
        lastWorkspaceMock,
        getTreeCacheMock,
        getSmartPropertyMock;


    mockServer = function($httpBackend, Config) {
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

    getApiFoundationMock = function() {
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

    getRepositoryMock = function() {
      var repository = fixtures.repositories[0];
      var workspace = getWorkspaceMock();
      var supports = true;
      return {
        getName: jasmine.createSpy('getName').andReturn(repository.name),
        getWorkspace: jasmine.createSpy('getWorkspace').andReturn(mixins.buildPromise(workspace)),
        getFactoryName: jasmine.createSpy('getFactoryName').andReturn(repository.factoryName),
        supports: jasmine.createSpy('supports').andCallFake(function() { return supports; }),
        getWorkspaces: jasmine.createSpy('getWorkspaces').andReturn(mixins.buildPromise([workspace])),
        setSupports: function(value) { supports = value; }
      };
    };

    getWorkspaceMock = function() {
      var workspace = fixtures.workspaces[0];
      var node = getNodeMock();
      var mock = {
        getName: jasmine.createSpy('getName').andReturn(workspace.name),
        // We don't return repositoryMock to avoid circular dependency
        getRepository: jasmine.createSpy('getRepository').andReturn({ getName: function() { return fixtures.repositories[0].name; }}),
        getNode: jasmine.createSpy('getNode').andReturn(mixins.buildPromise(node)),
        getSlug: jasmine.createSpy('getSlug').andReturn(workspace.name.replace(' ', '_')),
        delete: jasmine.createSpy('delete').andReturn(mixins.buildPromise(workspace)),
        create: jasmine.createSpy('create').andReturn(mixins.buildPromise(workspace))
      };
      lastWorkspaceMock = mock;
      return mock;
    };

    getSmartPropertyMock = function(property) {
      return {
        getName: jasmine.createSpy('getName').andReturn(property.name),
        getType: jasmine.createSpy('getType').andReturn(property.type),
        setType: jasmine.createSpy('setType').andReturn(mixins.buildPromise()),
        getValue: jasmine.createSpy('getValue').andReturn(mixins.buildPromise(property.value)),
        setValue: jasmine.createSpy('setValue').andReturn(mixins.buildPromise()),
        insert: jasmine.createSpy('insert').andReturn(mixins.buildPromise()),
        update: jasmine.createSpy('update').andReturn(mixins.buildPromise()),
        delete: jasmine.createSpy('delete').andReturn(mixins.buildPromise()),
        _property: property
      };
    };

    getNodeMock = function() {
      var node = fixtures.node;
      var supports = true;
      var repository = {
        getName: function() { return fixtures.repositories[0].name; },
        getWorkspaces: jasmine.createSpy('getWorkspaces').andReturn(mixins.buildPromise([])),
        supports: jasmine.createSpy('supports').andCallFake(function() { return supports; }),
      };

      var workspace = {
        getName: function() { return fixtures.workspaces[0].name; },
        getRepository: function() {
          return repository;
        }
      };

      var properties = [ getSmartPropertyMock({ name: 'jcr:mixinTypes', value: ['rep:AccessControllable'], type: 7 }) ];
      return {
        getName: jasmine.createSpy('getName').andReturn(node.name),
        // We don't return workspaceMock to avoid circular dependency
        getWorkspace: jasmine.createSpy('getWorkspace').andReturn(workspace),
        setProperty: jasmine.createSpy('setProperty').andReturn(mixins.buildPromise()),
        getReducedTree: jasmine.createSpy('getReducedTree').andReturn(fixtures.node.reducedTree),
        getPath: jasmine.createSpy('getPath').andReturn(node.path),
        getProperties: jasmine.createSpy('getProperties').andReturn(mixins.buildPromise(properties)),
        setRepositorySupports: function(value) { supports = value; },
        createProperty: jasmine.createSpy('createProperty').andReturn(mixins.buildPromise({})),
        getSmartPropertyMock: function() { return properties[0]; }
      };
    };

    getObjectMapperMock = function() {
      var repository = getRepositoryMock();
      var workspace = getWorkspaceMock();
      var node = getNodeMock();
      return {
        find: jasmine.createSpy('find').andCallFake(function(path) {
          var components = path.split('/');
          components.shift();

          if (components.length === 0 ) {
            return mixins.buildPromise([repository]);
          } else if (components.length === 1) {
            return mixins.buildPromise(repository);
          } else if (components.length === 2) {
            return mixins.buildPromise(workspace);
          } else {
            return mixins.buildPromise(node);
          }
        })
      };
    };

    getSmartPropertyFactoryMock = function() {
      return {
        build: jasmine.createSpy('build').andCallFake(getSmartPropertyMock),
        accept: jasmine.createSpy('accept').andReturn(true)
      };
    };

    getJsonPatchMock = function() {
      return {
        update: jasmine.createSpy('update'),
        delete: jasmine.createSpy('delete'),
        insert: jasmine.createSpy('insert'),
        get: jasmine.createSpy('get')
      };
    };

    getTreeCacheMock = function() {
      return {
        buildRichTree: jasmine.createSpy('buildRichTree'),
        getRichTree: jasmine.createSpy('getRichTree').andReturn(mixins.buildPromise({})),
        getCurrentRootNode: jasmine.createSpy('getCurrentRootNode').andReturn(getNodeMock())
      };
    };

    var buildFactoryMock = function(type) {
      return function() {
        return {
          build: jasmine.createSpy('build').andCallFake(function() {
            if (type === 'workspace') {
              return getWorkspaceMock();
            }
            return {};
          }),
          accept: jasmine.createSpy('accept').andReturn(true)
        };
      };
    };

    var buildFactoryWithPromiseMock = function(object) {
      return function() {
        return {
          build: jasmine.createSpy('build').andReturn(mixins.buildPromise(object || {})),
          accept: jasmine.createSpy('accept').andReturn(true)
        };
      };
    };

    var getRichTreeMock = function() {
      return {
        getRawTree: function() {
          return fixtures.richTree;
        }
      };
    };

    var getLastWorkspaceMock = function() {
      return lastWorkspaceMock;
    };

    return {
      mockServer: mockServer,
      getApiFoundationMock: getApiFoundationMock,
      getRepositoryMock: getRepositoryMock,
      getWorkspaceMock: getWorkspaceMock,
      getNodeMock: getNodeMock,
      getObjectMapperMock: getObjectMapperMock,
      getSmartPropertyFactoryMock: getSmartPropertyFactoryMock,
      getRepositoryFactoryMock: buildFactoryMock(),
      getWorkspaceFactoryMock: buildFactoryMock('workspace'),
      getRichTreeFactoryMock: buildFactoryWithPromiseMock(getRichTreeMock()),
      getRichTreeMock: getRichTreeMock,
      getNodeFactoryMock: buildFactoryMock(),
      getJsonPatchMock: getJsonPatchMock,
      getLastWorkspaceMock: getLastWorkspaceMock,
      getTreeCacheMock: getTreeCacheMock
    };
  });
