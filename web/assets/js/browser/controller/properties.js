angular.module('browserApp').controller('PropertiesCtrl', function PropertiesCtrl($scope,$rootScope) {
	$rootScope.$watch('activeNode', function(){
		if($rootScope.activeNode !== null){
    		compileProperties($rootScope.activeNode);
    	}
  	});

    $rootScope.$on('api.nodePropertiesChanged', function(e, node){
        compileProperties(node);
    });

  	function compileProperties(node){
        var prop = {};
        for(p in node.nodeProperties){
            if(p.substr(0,'_node_prop_'.length) == '_node_prop_' && node.nodeProperties[p] !== undefined){
                prop[p.substr('_node_prop_'.length)] = node.nodeProperties[p];
            }
        }
        $rootScope.properties = prop;
    }

    $scope.hasProperties = function(){
    	return _.size($rootScope.properties) > 0;
    }

    $scope.deleteProperty = function(name){
        $rootScope.$emit('property.delete', $rootScope.activeNode.path, name);
    }

    $scope.addProperty = function(name,value){
        $scope.newName = undefined;
        $scope.newValue = undefined;
        $rootScope.$emit('property.add', $rootScope.activeNode.path, name, value);
    }
});
