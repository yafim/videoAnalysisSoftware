/**
 * Holds the elments of the upper menu.
 * 
 */
app.directive('tree', function() {
  return {
    restrict: "E",
    replace: true,
    scope: {
      tree: '='
    },
    templateUrl: './views/templates/template-ul.html',
    controller: function($scope, $element, $attrs){
    }
  };
});

/**
 * Holds the elments of the upper menu (the leaves)
 * 
 */
app.directive('leaf', function($compile, $location) {

  return {
    restrict: "E",
    replace: true,
    scope: {
      leaf: "="
    },
    templateUrl: './views/templates/template-li.html',
    controller: function($scope, $element, $attrs) {

      // If a sub tree (with other menu)
      if (angular.isArray($scope.leaf.subtree)) {
        $element.append("<tree tree='leaf.subtree'></tree>");
        $element.addClass('dropdown-submenu');
        $compile($element.contents())($scope);
      } else {
          $element.bind('click', function() {
            if(!menuItem.isLocked){
                menuItem.isLocked = true;
                handleClickEvent($scope.leaf.link);
            } 
          });
      }

      // Checks if the link was function or a link to html page
      function handleClickEvent(i_Sender){
          if (typeof i_Sender == 'function'){
            i_Sender();
          } 
          else {
            if (i_Sender != "#"){
              $location.path(i_Sender);            
            }
          }
          menuItem.isLocked = false;
        }
    }
  };
});