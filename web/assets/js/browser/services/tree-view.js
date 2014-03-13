(function(angular, app) {
  'use strict';

  app.service('mbTreeView', ['$rootScope', 'mbRouteParametersConverter', function($rootScope, RouteParametersConverter) {
    var container = {
      tree: {}
    };

    var find = function(path, root){
      function search(target, tree){
        if(target.length > 0){
          for (var child in tree.children){
            if (tree.children.hasOwnProperty(child) && target[0] === tree.children[child].name){
              target.shift();
              return search(target,tree.children[child]);
            }
          }
        }
        return tree;
      }

      var target = path.split('/');
      target.shift();
      return search(target, root);
    };

    var normalize = function (tree){
      for (var node in tree.children) {
        if (tree.children.hasOwnProperty(node)) {
          tree.children[node] = normalize(tree.children[node]);
        }
      }

      if (tree.children.length > 0) {
        tree.collapsed = false;
      } else {
        tree.collapsed = true;
      }

      return tree;
    };

    var initContainer = function() {
      RouteParametersConverter.getCurrentNode().then(function(node) {
        container.tree = { '/': normalize(node.getReducedTree()[0]) };
        container.workspace = node.getWorkspace();
        container.repository = node.getWorkspace().getRepository();
      });
    };

    initContainer();

    this.getTreeContainer = function() {
      return container;
    };

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === 'workspace' && fromState.name !== 'workspace') {
        initContainer();
      } else if(toState.name === fromState.name &&
        (toParams.repository !== fromParams.repository ||
        toParams.workspace !== fromParams.workspace)) {
        initContainer();
      } else if(toState.name === fromState.name &&
        toState.name === 'workspace' &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace &&
        toParams.path !== fromParams.path) {
        var target = find(toParams.path, container.tree['/']);
        if (!target.collapsed) {
          target.updateInProgress = true;
          RouteParametersConverter.getCurrentNode().then(function(node) {
            target.children = normalize(node.getRawData()).children;
            target.updateInProgress = false;
          }, function() {
            target.updateInProgress = false;
          });
        }
      }
    });
  }]);
})(angular, angular.module('browserApp'));