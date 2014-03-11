// Add depedency for our services to force them to laod in a correct scope and access to ng-init
angular.module('browserApp').controller('TreeCtrl', function TreeCtrl($scope, $rootScope, locationProvider, mbApi) {
  var tabIndex = 0;

  mbApi.getRepository('repository_test').then(function(repository) {
    return repository.getWorkspaces();
  }).then(function(workspaces) {
    return workspaces[0].getRootNode();
  }).then(function(rootNode) {
    console.log(rootNode);
  });

  $scope.$on('api.nodeChanged', function(e,node) {
  		if($rootScope.activeNode !== null){
  			$rootScope.activeNode.selected = undefined;
  		}

    	$rootScope.activeNode = node;
    	$rootScope.activeNode.selected = 'active';
  	});

  	$scope.collapse = function (node, notEmit){
      if(!notEmit){
        $scope.$emit('tree.nodeCollapsed',node);
      }

  		node.collapsed = !node.collapsed;
  	}
});
