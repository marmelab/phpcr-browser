angular.module('browserApp').service('locationProvider', ['$rootScope','$location','$window',function ($rootScope, $location,$window) {
	var setPath = function(newPath){
		$rootScope.path = newPath;
		$rootScope.$emit('locationProvider.pathChanged', $rootScope.path);
	}

	$rootScope.$watch(function(){
		return $location.path();
	}, function(){
		var prefix = $rootScope.baseUrl+$rootScope.repository+'/'+$rootScope.workspace;

		if($location.path().length > prefix.length){
			setPath($location.path().substr(prefix.length));
		}else if($location.path().length == prefix.length){
			setPath('/');
		}else{
			$window.location.href = $location.path();
		}
	});
}]);
