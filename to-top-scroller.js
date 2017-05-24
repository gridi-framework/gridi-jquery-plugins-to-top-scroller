(function ( $ ) {
    'use strict';

    var ToTopScroller = function(element, options) {
        var documentElement = $(document);
        var bodyElement = $('body');
        var toTopScrollerElement = $(element);
        var topLimiterElement = false,
            bottomLimiterElement = false;
        var toTopScrollerElementHeight, toTopScrollerElementTop, windowHeight;
        var isScrollerLimitedOnTop = false,
            isScrollerLimitedOnBottom = false;

        var settings = $.extend(true, {
            animateDuration: 400,
            animateFunction: 'linear',
            elements: {
                topLimiter: false,
                bottomLimiter: false
            },
            classes: {
                initialized: 'scroller-initialized',
                windowIsTop: 'window-is-top',
                windowIsBottom: 'window-is-bottom',
                scrollerLimitedOnTop: 'scroller-limited-on-top',
                scrollerLimitedOnBottom: 'scroller-limited-on-bottom'
            },
            elementsClasses: {
                onScrollerLimitedOnTop: {}, //make { className: [element, element, ...], secondClassName: [element, ...]}
                onScrollerLimitedOnBottom: {}
            }
        }, options);

        if($.type(settings.elements.topLimiter) === 'string' || $.type(settings.elements.topLimiter) === 'object') {
            topLimiterElement = $(settings.elements.topLimiter);
            settings.elementsClasses.onScrollerLimitedOnTop = makeJQueryElements(settings.elementsClasses.onScrollerLimitedOnTop);
        }

        if($.type(settings.elements.bottomLimiter) === 'string' || $.type(settings.elements.bottomLimiter) === 'object') {
            bottomLimiterElement = $(settings.elements.bottomLimiter);
            settings.elementsClasses.onScrollerLimitedOnBottom = makeJQueryElements(settings.elementsClasses.onScrollerLimitedOnBottom);
        }


        toTopScrollerElement.addClass(settings.classes.initialized);
        toTopScrollerElement.on('click', eventScrollToTop);

        refresh();
        $(window).on('resize', refresh);
        $(window).on('scroll', chackWindowPositionPosition);

        function eventScrollToTop(event) {
            event.preventDefault();
            event.stopPropagation();
            scrollToTop();
        }

        function scrollToTop() {
            toTopScrollerElement.trigger('start-scrolling');
            bodyElement.animate({
                scrollTop: 0
            }, settings.animateDuration, settings.animateFunction, function() {
                toTopScrollerElement.trigger('end-scrolling');
            } );
        }

        function refresh() {
            windowHeight = $(window).height();
            toTopScrollerElement.removeClass(settings.classes.windowIsTop);
            toTopScrollerElement.removeClass(settings.classes.windowIsBottom);

            if(topLimiterElement.length > 0 || bottomLimiterElement.length > 0) {
                $(window).off('scroll', chackScrollerPosition);
                toTopScrollerElement.removeClass(settings.classes.scrollerLimitedOnTop);
                toTopScrollerElement.removeClass(settings.classes.scrollerLimitedOnBottom);

                if(isFixedScroller()) {
                    toTopScrollerElement.css({
                        top: '',
                        bottom: ''
                    });
                    toTopScrollerElementHeight = toTopScrollerElement.outerHeight(true);
                    toTopScrollerElementTop = parseInt(toTopScrollerElement.position().top);
                    toTopScrollerElement.css({
                        top: toTopScrollerElementTop,
                        bottom: 'auto'
                    });
                    isScrollerLimitedOnTop = false;
                    isScrollerLimitedOnBottom = false;

                    chackScrollerPosition();
                    $(window).on('scroll', chackScrollerPosition);
                }
            }

            chackWindowPositionPosition();
        }

        function chackWindowPositionPosition() {
            var currentScrollTop = documentElement.scrollTop();

            if(currentScrollTop <= 0) {
                if(!toTopScrollerElement.hasClass(settings.classes.windowIsTop)) {
                    toTopScrollerElement.addClass(settings.classes.windowIsTop);
                }
            } else if(toTopScrollerElement.hasClass(settings.classes.windowIsTop)) {
                toTopScrollerElement.removeClass(settings.classes.windowIsTop);
            }

            if((currentScrollTop + windowHeight) >= $(document).outerHeight(true)) {
                if(!toTopScrollerElement.hasClass(settings.classes.windowIsBottom)) {
                    toTopScrollerElement.addClass(settings.classes.windowIsBottom);
                }
            } else if(toTopScrollerElement.hasClass(settings.classes.windowIsBottom)) {
                toTopScrollerElement.removeClass(settings.classes.windowIsBottom);
            }
        }

        function isFixedScroller() {
            return (toTopScrollerElement.css('position') == 'fixed');
        }

        function chackScrollerPosition() {
            var currentScrollTop = documentElement.scrollTop();
            var limitOffsetTop, newToTopScrollerElementTop;

            //check limit by top limiter
            if(topLimiterElement.length > 0) {
                limitOffsetTop = topLimiterElement.offset().top + topLimiterElement.outerHeight();
                newToTopScrollerElementTop = limitOffsetTop - currentScrollTop;

                if(newToTopScrollerElementTop > toTopScrollerElementTop) {
                    toTopScrollerElement.css('top', newToTopScrollerElementTop);
                    if(isScrollerLimitedOnTop === false) {
                        isScrollerLimitedOnTop = true;
                        toTopScrollerElement.addClass(settings.classes.scrollerLimitedOnTop);
                        addElementsClasses(settings.elementsClasses.onScrollerLimitedOnTop);
                        toTopScrollerElement.trigger('scroller-start-limited-on-top');
                    }
                } else if(isScrollerLimitedOnTop === true) {
                    toTopScrollerElement.css('top', toTopScrollerElementTop);
                    isScrollerLimitedOnTop = false;
                    toTopScrollerElement.removeClass(settings.classes.scrollerLimitedOnTop);
                    removeElementsClasses(settings.elementsClasses.onScrollerLimitedOnTop);
                    toTopScrollerElement.trigger('scroller-stop-limited-on-top');
                }
            }

            //check limit by bottom limiter
            if(bottomLimiterElement.length > 0) {
                limitOffsetTop = bottomLimiterElement.offset().top;
                newToTopScrollerElementTop = (limitOffsetTop - currentScrollTop) - toTopScrollerElementHeight;

                if(newToTopScrollerElementTop < toTopScrollerElementTop && isScrollerLimitedOnTop === false) {
                    toTopScrollerElement.css('top', newToTopScrollerElementTop);
                    if(isScrollerLimitedOnBottom === false) {
                        isScrollerLimitedOnBottom = true;
                        toTopScrollerElement.addClass(settings.classes.scrollerLimitedOnBottom);
                        addElementsClasses(settings.elementsClasses.onScrollerLimitedOnBottom);
                        toTopScrollerElement.trigger('scroller-start-limited-on-bottom');
                    }
                } else {
                    if(isScrollerLimitedOnTop === false && isScrollerLimitedOnBottom === true) {
                        toTopScrollerElement.css('top', toTopScrollerElementTop);
                    }

                    if(isScrollerLimitedOnTop === true || isScrollerLimitedOnBottom === true) {
                        isScrollerLimitedOnBottom = false;
                        toTopScrollerElement.removeClass(settings.classes.scrollerLimitedOnBottom);
                        removeElementsClasses(settings.elementsClasses.onScrollerLimitedOnBottom);
                        toTopScrollerElement.trigger('scroller-stop-limited-on-bottom');
                    }
                }
            }
        }

        function makeJQueryElements(elements) {
            $.each(elements, function(index, insideElements) {
                $.each(insideElements, function(elementIndex, element) {
                    elements[index][elementIndex] = $(element);
                });
            });

            return elements;
        }

        function addElementsClasses(elements) {
            $.each(elements, function(cssClass, classElements) {
                $.each(classElements, function(elementIndex, element) {
                    element.addClass(cssClass);
                });
            });
        }

        function removeElementsClasses(elements) {
            $.each(elements, function(cssClass, classElements) {
                $.each(classElements, function(elementIndex, element) {
                    element.removeClass(cssClass);
                });
            });
        }
    };

    //Initialize jQuery function
    $.fn.toTopScroller = function() {
        var toTopScrollerElements = this;
        var i, returnValue;

        for (i = 0; i < toTopScrollerElements.length; i++) {
            var toTopScrollerElement = toTopScrollerElements[i];

            if(toTopScrollerElement.toTopScroller instanceof ToTopScroller) {
                if(typeof toTopScrollerElement.toTopScroller[arguments[0]] === 'function') {
                    returnValue = toTopScrollerElement.toTopScroller[arguments[0]].apply(Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Function: "' + arguments[0] + '" no exist';
                }
            } else {
                toTopScrollerElement.toTopScroller = new ToTopScroller(toTopScrollerElement, arguments[0]);
            }
        }

        if (typeof returnValue !== 'undefined') {
            return returnValue;
        }

        return toTopScrollerElements;
    };

}( jQuery ));
