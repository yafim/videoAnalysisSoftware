/**
 * Update form after fields updated
 * @param  {[type]} 	          [description]
 * @param  {[type]} 			  [description]
 * @return {[type]}               [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.directive("formOnChange", function($parse, $interpolate){
  return {
    require: "form",
    link: function(scope, element, attrs, form){
      var cb = $parse(attrs.formOnChange);
      element.on("change", function(){
        cb(scope);
      });
    }
  };
});