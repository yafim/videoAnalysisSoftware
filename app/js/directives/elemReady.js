/** 
 * When some element is ready, invoke function.
 * @param  {[type]}        [description]
 * @return {[type]}        [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.directive( 'elemReady', function( $parse ) {
   return {
       restrict: 'A',
       link: function( $scope, elem, attrs ) {    
          elem.ready(function(){
            $scope.$apply(function(){
                var func = $parse(attrs.elemReady);
                func($scope);
            })
          })
       }
    }
})