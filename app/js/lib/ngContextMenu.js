(function ContextMenu($angular, $document) {

    "use strict";

    /**
     * @module ngContextMenu
     * @author Adam Timberlake
     * @link https://github.com/Wildhoney/ngContextMenu
     */
    var module = $angular.module('ngContextMenu', []);

    /**
     * @module ngContextMenu
     * @service ContextMenu
     * @author Adam Timberlake
     * @link https://github.com/Wildhoney/ngContextMenu
     */
    module.factory('contextMenu', ['$rootScope', function contextMenuService($rootScope) {

        /**
         * @method cancelAll
         * @return {void}
         */
        function cancelAll() {
            $rootScope.$broadcast('context-menu/close');
        }
        return { cancelAll: cancelAll, eventBound: false };

    }]);

    /**
     * @module ngContextMenu
     * @directive contextMenu
     * @author Adam Timberlake
     * @link https://github.com/Wildhoney/ngContextMenu
     */
    module.directive('contextMenu', ['$timeout', '$interpolate', '$compile', 'contextMenu', '$templateRequest',

        function contextMenuDirective($timeout, $interpolate, $compile, contextMenu, $templateRequest) {

            return {

                /**
                 * @property restrict
                 * @type {String}
                 */
                restrict: 'EA',

                /**
                 * @property scope
                 * @type {Boolean}
                 */
                scope: true,

                /**
                 * @property require
                 * @type {String}
                 */
                require: '?ngModel',

                /**
                 * @method link
                 * @param {Object} scope
                 * @param {angular.element} element
                 * @param {Object} attributes
                 * @param {Object} model
                 * @return {void}
                 */
                link: function link(scope, element, attributes,model) {

                    // VARIABLES
                    // start time
                    var videoMilliSec,videoSeconds, videoMinutes, abs_videoTimeInSeconds;
                    // end time
                    var min_endTime, sec_endTime, milli_endTime;
                    var duration;
                    //END



                    if (!contextMenu.eventBound) {

                        // Bind to the `document` if we haven't already.
                        $document.addEventListener('click', function click() {
                            contextMenu.cancelAll();
                            scope.$apply();
                        });

                        contextMenu.eventBound = true;

                    }

                    /**
                     * @method closeMenu
                     * @return {void}
                     */
                    function closeMenu() {
                        if (scope.menu && 
                            document.activeElement.nodeName != "INPUT" && document.activeElement.nodeName != "BODY") {
                            scope.menu.remove();
                            scope.menu     = null;
                            scope.position = null;
                        }

                    }

                    scope.submitBox = function(){
                        // min_endTime = document.getElementsByName('min_endTime')[0].value;
                        // sec_endTime = document.getElementsByName('sec_endTime')[0].value;
                        // milli_endTime = document.getElementsByName('milli_endTime')[0].value;
                        // duration = document.getElementsByName('duration')[0].value;

                        // alert(duration);
                        scope.$emit('submitBoxPressed');
                        scope.$emit('clearRectangle');
                    }

                    scope.cancelBox = function(){
                        scope.$emit('cancelBoxPressed');
                        scope.$emit('clearRectangle');
                    }

                    scope.$on('context-menu/close', closeMenu);

                    scope.$on('boxCreated', function(e, data){
                        render(event, 'append');
                        splitVideoTime(data.video);

                        scope.startTime = {
                            seconds: videoSeconds,
                            minutes: videoMinutes,
                            milli: videoMilliSec
                        };
                    });

                    function splitVideoTime(videoTimeInSeconds){
                    abs_videoTimeInSeconds = Math.floor(videoTimeInSeconds);

                    videoSeconds = abs_videoTimeInSeconds % 60;
                    videoMilliSec = videoTimeInSeconds.toString().split('.')[1];
                    videoMinutes = (abs_videoTimeInSeconds - videoSeconds) / 60;
                    }

                    /**
                     * @method getModel
                     * @return {Object}
                     */
                    function getModel() {
                        return model ? $angular.extend(scope, model.$modelValue) : scope;
                    }

                    /**
                     * @method render
                     * @param {Object} event
                     * @param {String} [strategy="append"]
                     * @return {void}
                     */
                    function render(event, strategy) {
                        
                        strategy = strategy || 'append';

                        if ('preventDefault' in event) {

                            contextMenu.cancelAll();
                            event.stopPropagation();
                            event.preventDefault();
                            scope.position = { x: event.clientX, y: event.clientY };

                        } else {

                            if (!scope.menu) {
                                return;
                            }

                        }

                        $templateRequest(attributes.contextMenu).then(function then(response) {
                            // Only one menu allowed
                            if (!scope.menu){

                                var compiled     = $compile(response)($angular.extend(getModel())),
                                    menu         = $angular.element(compiled);




                                // Determine whether to append new, or replace an existing.
                                switch (strategy) {
                                    case ('append'): element.append(menu); break;
                                    default: scope.menu.replaceWith(menu); break;
                                }


                                var fixedPositionX = getFixedPositionX(menu[0].clientWidth, scope.position.x);
                                var fixedPositionY = getFixedPositionY(menu[0].clientHeight, scope.position.y);

                                menu.css({

                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    transform: $interpolate('translate({{x}}px, {{y}}px)')({
                                        x: fixedPositionX,
                                        y: fixedPositionY
                                    })

                                });

                                scope.menu = menu;
                                scope.menu.bind('click', closeMenu);

                            }

                        });

                    }

                    if (model) {
                        var listener = function listener() {
                            return model.$modelValue;
                        };

                        // Listen for updates to the model...
                        scope.$watch(listener, function modelChanged() {
                            render({}, 'replaceWith');
                        }, true);

                    }

                    element.bind(attributes.contextEvent || 'contextmenu', render);

                }

            }

            function getFixedPositionX(i_ItemWidth, i_XPosition){
                if (i_ItemWidth + i_XPosition > window.innerWidth){
                    return Math.abs(i_ItemWidth - i_XPosition);
                }
                return i_XPosition;
            }

            function getFixedPositionY(i_ItemHeight, i_YPosition){
                if (i_ItemHeight + i_YPosition > window.innerHeight){
                    return Math.abs(i_ItemHeight - i_YPosition);
                }
                return i_YPosition;
            }

        }]);

})(window.angular, window.document);
