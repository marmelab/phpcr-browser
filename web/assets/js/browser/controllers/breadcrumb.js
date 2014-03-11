angular.module('browserApp').controller('BreadcrumbCtrl', function TreeCtrl($scope) {
	$scope.$watch('activeNode', function(){
		if($scope.activeNode !== null){
    		compileBreadcrumb($scope.activeNode);
    	}
  	});

  	function compileBreadcrumb (node){
        var d = [{ 
            'name': '/',
            'path': '',
            'dropdown': node.path == '/',
            'class': node.path == '/' ? 'btn-primary' : 'btn-default'
        }];

        if(node.path != '/'){
            var b = node.path.split('/');
            b.shift();
            var path = '';

            for(c in b){
                path += '/' + b[c];
                d.push({
                    'name': b[c],
                    'path': path,
                    'dropdown': c == b.length -1,
                    'class': c == b.length - 1 ? 'btn-success' : 'btn-default'
                });
            }
        }
        $scope.breadcrumb = d;
    }
});
