(function(angular, app) {
  'use strict';

  app.controller('mbTreeCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
      mbRouteParametersConverter.getCurrentNode().then(function(node) {
        $scope.currentNode = node;
      }, function(err) {
        $log.error(err);
      });
    }]);
})(angular, angular.module('browserApp'));

// angular.module('browserApp').controller('TreeCtrl', function TreeCtrl($scope, $rootScope, ) {
//   var tabIndex = 0;


//   // $scope.$on('api.nodeChanged', function(e,node) {
//   // 		if($rootScope.activeNode !== null){
//   // 			$rootScope.activeNode.selected = undefined;
//   // 		}

//   //   	$rootScope.activeNode = node;
//   //   	$rootScope.activeNode.selected = 'active';
//   // 	});

//   // 	$scope.collapse = function (node, notEmit){
//   //     if(!notEmit){
//   //       $scope.$emit('tree.nodeCollapsed',node);
//   //     }

//   // 		node.collapsed = !node.collapsed;
//   // 	}
// });
