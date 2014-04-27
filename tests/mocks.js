/*global define*/
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

    return {
      mockServer: mockServer
    };
  });
