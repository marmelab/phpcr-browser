angular.module('browserApp').service('browserAPI', ['$rootScope','Restangular', function ($rootScope, Restangular) {
	/*
	 * Restangular init
	 */
	Restangular.setBaseUrl('/_api');
	/*
	 * Pointer for API Request on current workspace
	 */
    var workspaceURI = Restangular.one('repositories',$rootScope.repository).one('workspaces',$rootScope.workspace);
	
	/**
	 *	Flag for first page load
	 */
	$rootScope._first_load = false;

	$rootScope.$on('locationProvider.pathChanged', function(e,path) {
    	if(!$rootScope._first_load){
    		loadReducedTree(path);
    	}else{
    		loadNode(path);
    	}
  	});

	$rootScope.$on('tree.nodeCollapsed', function(e,node, prevent) {
		loadNode(node.path, !!prevent || true);
	});

	$rootScope.$on('property.delete', function(e,path, name) {
		deleteNodeProperty(path,name);
	});


	$rootScope.$on('property.add', function(e,path, name, value) {
		addNodeProperty(path,name, value);
	});

	/*
	 * Perform query on current workspace
	 */
	function query(path, params, callback){
		path = path || '/';
		params = params || {};

		if(path == '/'){
        	workspaceURI.getList('nodes',params).then(callback, function(response) {
			  console.log("Error with status code", response.status);
			});
	    }else{
	    	workspaceURI.one('nodes',path.slice(1,path.length)).get(params).then(callback, function(response) {
			  console.log("Error with status code", response.status);
			});
	    }
	}
	
  	function loadReducedTree(path){
  		query(path, {'reducedTree': true}, function(response){
  			$rootScope.tree  = { '/' : normalizeTree(response['node']['reducedTree'][0]) };
			$rootScope._first_load = true;
			var node = $rootScope.findNode(path, $rootScope.tree['/']);
			node['nodeProperties'] =  response['node']['nodeProperties'];
			node._data_loaded = true;
			node.collapsed = false;
			$rootScope.$broadcast('api.nodeChanged', node);
  		});
  	}

 	function normalizeTree(tree){
        for (node in tree.children) {
            // Checks that node is integer to exclude restangular attributes
            if (tree.children.hasOwnProperty(node) && ~~node == node){
              tree.children[node] = normalizeTree(tree.children[node]);
            }
        }

        if(tree.children.length > 0){
            tree['collapsed'] = false;
        }else{
            tree['collapsed'] = true;
        }

        return tree;
    }

  	function loadNode(path, prevent){
  		var node = $rootScope.findNode(path, $rootScope.tree['/']);
  		if(!node._data_loaded){
  			node._data_loading = true;
	  		query(path, {}, function(response){
	  			node._data_loading = undefined;
	            response =  normalizeTree(response['node']);
	           
	            // Let's append the children if not already done on other loading
	            if(_.size(node['children']) == 0){
	            	node['children'] = response['children'];
	            }

	            node['nodeProperties'] =  response['nodeProperties'];

	           	node._data_loaded = true;
	           	if(!prevent){
					$rootScope.$broadcast('api.nodeChanged', node);
				}
	  		});
	  	}else{
	  		if(!prevent){
				$rootScope.$broadcast('api.nodeChanged', node);
			}
	  	}
  	}

  	function deleteNodeProperty(path, name){;
  		var node = $rootScope.findNode(path, $rootScope.tree['/']);
  		path = path.slice(1,path.length);
  		workspaceURI.one('nodes',path+'@'+name).remove().then(function(response){
  			node.nodeProperties['_node_prop_'+name] = undefined;
  			$rootScope.$broadcast('api.nodePropertiesChanged', node);
  		}, function(response) {
  			alert('An error occurred during property deletion');
			console.log("Error with status code", response.status);
		});
  	}

  	function addNodeProperty(path, name, value){;
  		var node = $rootScope.findNode(path, $rootScope.tree['/']);
  		path = path.slice(1,path.length);
  		
  		var property = { 
  			'name': name,
  			'value': value
  		};

  		workspaceURI.all('nodes').all(path).post(property).then(function(response){
  			node.nodeProperties['_node_prop_'+name] = value;
  			$rootScope.$broadcast('api.nodePropertiesChanged', node);
  		}, function(response) {
  			alert('An error occurred during property creation');
			console.log("Error with status code", response.status);
		});
  	}
}]);
