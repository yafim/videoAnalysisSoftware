/**
 * Statistics window controller.
 * 
 * @param  {[type]}                   [description]
 * @param  {[type]}                   [description]
 * @param  {[type]}                   [description]
 * @param  {Object}                   [description]
 * @return {[type]}                   [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.controller('StatisticsCtrl', function ($scope, sharedProperties) {

    var listOfRectangles = sharedProperties.getListOfRectangles();

    $scope.chartObject = {};
    
    $scope.chartObject.type = "PieChart";

    $scope.chartObject.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Slices", type: "number"}
    ], "rows": []};

    $scope.chartObject.options = {
        'title': 'AOI Comparison'
    };

    setChartObject();

    function setChartObject(){
        for(var rect in listOfRectangles){
            var c = 
                {c:[
                    {v: listOfRectangles[rect].description},
                    {v: listOfRectangles[rect].counter}
                ]}
            ;

            $scope.chartObject.data["rows"].push(c);
        }

    }
});