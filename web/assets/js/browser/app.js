var app = angular.module('browserApp', ['restangular', 'xeditable']);

app.run(function ($rootScope) {
	$rootScope.path = '/';
	$rootScope.tree = {};
	$rootScope.activeNode = null;
	$rootScope.properties = {};
	$rootScope.breadcrumb = [];

	$rootScope.isEmpty = function(obj){
        return _.size(obj) == 0;
    };

    $rootScope.getTypeOf = function(obj){
        return typeof obj;
    };

    $rootScope.findNode = function(path, root){
       	function search(target, tree){
       	 	if(target.length > 0){
            	for(child in tree.children){
                	if (tree.children.hasOwnProperty(child) && ~~child == child && target[0] == tree.children[child].name){
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
    }
});

app.config(function($locationProvider){
    $locationProvider.html5Mode(true);
});

app.filter('propertyNameFilter', function() {
  return function(input, term) {
    var regex = new RegExp(term, 'i');
    var obj = {};
    angular.forEach(input, function(v, i){
      if(regex.test(i + '')){
        obj[i]=v;
      }
    });
    return obj;
  };
});

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
