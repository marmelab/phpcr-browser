// Adapted from http://stackoverflow.com/a/18793468
app.directive('confirmClick', function() {
    return {
        restrict: 'A',
        link: function(scope, elt, attrs) {
            elt.bind('click', function(e) {
                var message = attrs.confirmation || "Are you sure you want to do that?";
                if (window.confirm(message)) {
                    var action = attrs.confirmClick;
                    if (action){
                        scope.$apply(scope.$eval(action));
                    }
                }
            });
        },
    };
})
