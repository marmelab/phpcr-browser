angular.module('browserApp').controller('PropertiesCtrl', function PropertiesCtrl($scope,$rootScope) {
	$rootScope.$watch('activeNode', function(){
		if($rootScope.activeNode !== null){
    		compileProperties($rootScope.activeNode);
    	}
  	});

  	function compileProperties(node){
        var prop = {};
        for(p in node.nodeProperties){
            if(p.substr(0,'_node_prop_'.length) == '_node_prop_'){
                prop[p.substr('_node_prop_'.length)] = node.nodeProperties[p];
            }
        }
        $rootScope.properties = prop;
    }

    function hasProperties(){
    	return _.size($rootScope.properties) > 0;
    }
});
