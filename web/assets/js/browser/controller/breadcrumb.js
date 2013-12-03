angular.module('browserApp').controller('BreadcrumbCtrl', function TreeCtrl($scope) {
	$scope.$watch('activeNode', function(){
		if($scope.activeNode !== null){
    		compileBreadcrumb($scope.activeNode);
    	}
  	});

  	function compileBreadcrumb (node){
        if(node.path == '/'){
            $scope.breadcrumb = [];
        }else{
            var b = node.path.split('/');
            b.shift();
            var d = [];
            var path = '';

            for(c in b){
                path += '/' + b[c];
                d.push({
                    'name': b[c],
                    'path': path
                });
            }
            $scope.breadcrumb = d;
        }
    }
});
