(function(angular, app) {
  'use strict';

  app.service('mbTreeView', ['$rootScope', '$location', 'mbObjectMapper', 'mbRouteParametersConverter',
    function($rootScope, $location, ObjectMapper, RouteParametersConverter) {
    var container = {
      tree: {}
    };

    var find = function(path, root){
      function search(target, tree){
        if(target.length > 0){
          for (var child in tree.children){
            if (tree.children.hasOwnProperty(child) &&
                tree.children[child] &&
                target[0] === tree.children[child].name){
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

    var deleteNode = function(path) {
      var parent = path.split('/');
      parent.pop();
      parent = parent.join('/');
      parent = find(parent, container.tree['/']);

      for (var child in parent.children){
        if (parent.children[child] && parent.children[child].path === path) {
          if (parent.children.length === 1) { parent.hasChildren = false; }
          return (parent.children[child] = undefined);
        }
      }
    };

    var normalize = function (tree){
      for (var node in tree.children) {
        if (tree.children.hasOwnProperty(node)) {
          if (tree.children[node]) {
            tree.children[node] = normalize(tree.children[node]);
          }
        }
      }

      tree.slug = tree.path.replace('/', '_');
      if (tree.children.length > 0) {
        tree.collapsed = false;
      } else {
        tree.collapsed = true;
      }

      return tree;
    };

    var initContainer = function(first) {
      RouteParametersConverter.getCurrentNode().then(function(node) {
        container.tree['/'] = normalize(node.getReducedTree()[0]);
        container.workspace = node.getWorkspace();
        container.repository = node.getWorkspace().getRepository();
        if (first) { $rootScope.$emit('browser.loaded'); }
      });
    };

    $rootScope.$emit('browser.load');
    initContainer(true);

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === 'workspace' && fromState.name !== 'workspace') {
        $rootScope.$emit('browser.load');
        initContainer(true);
      } else if(toState.name === fromState.name &&
        (toParams.repository !== fromParams.repository ||
        toParams.workspace !== fromParams.workspace)) {
        $rootScope.$emit('browser.load');
        initContainer(true);
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

    $rootScope.$on('node.deleted', function(e, path) {
      deleteNode(path);
      var absolutePath = '/' + container.repository.getName() + '/' + container.workspace.getName() + path;

      // If we are on/in a deleted node we have to go back in hierarchy
      if (absolutePath === $location.path().slice(0, absolutePath.length)) {
        var parent = path.split('/');
        parent.pop();
        parent = parent.join('/');
        $location.path('/' + container.repository.getName() + '/' + container.workspace.getName() + parent);
      }
    });

    this.getTreeContainer = function() {
      return container;
    };

    $rootScope.$on('node.moved', function(e, data) {
      var parent = data.from.split('/');
      parent.pop();
      parent = parent.join('/');
      parent = find(parent, container.tree['/']);
      parent.updateInProgress = true;
      ObjectMapper.find('/' + container.repository.getName() + '/' + container.workspace.getName() + parent.path).then(function(node) {
        parent.children = normalize(node.getRawData()).children;
        parent.updateInProgress = false;
      });

      var target = find(data.to, container.tree['/']);
      target.updateInProgress = true;
      ObjectMapper.find('/' + container.repository.getName() + '/' + container.workspace.getName() + target.path).then(function(node) {
        target.children = normalize(node.getRawData()).children;
        target.updateInProgress = false;
      });
    });
  }]);
})(angular, angular.module('browserApp'));