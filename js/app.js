var AJS = {
  "host": "http://locahost:3000"
};
var x = window.location.href;

$.fn.reverse = [].reverse;

$.fn.hasAttr = function(name) {
 return this.attr(name) !== undefined;
};


  // DETECT DEVICE  ==============================================================

  var device = (function() {

    var isIE = IEVersion = false
    md = new MobileDetect(window.navigator.userAgent);

    var init = function() {
      bindEvents();
    }

    var bindEvents = function() {
      $('body').on('mousemove', 'img', function() {
        return false;
      });
    };

    var isSmartPhone = function() {
      // return ($(window).width()  < 768);
      return window.matchMedia("('max-width: 767px')").matches;
    }

    // Is that an IOS ?
    var isIOS = function() {
      // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      return isIOS;
    }

    var isTablet = function() {
      // return ($(window).width() > 992 &&  $(window).width() < 768);
      return window.matchMedia("(min-width: 768) and (max-width: 1219px)").matches;
    }


    // Is that a Desktop ?
    var isDesktop = function() {
      // return ($(window).width()  >= 992);
      return window.matchMedia("(min-width: 1220px)").matches;
    }

    // Get internet explorer version https://gist.github.com/Macagare/4044440
    var getInternetExplorerVersion = function() {
      var rv = -1; // Return value assumes failure.
      if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
          rv = parseFloat(RegExp.$1);
      }
      if (rv != -1) {
        isIE = true;
      }
      return rv;
    }

    var isMobile = function() {
      return $('html').hasClass('is-handled');
    }

    var lightVersion = function() {
      IEVersion = getInternetExplorerVersion();
      if (isMobile() || !isDesktop() || (isIE && IEVersion < 10)) {
        return true;
      } else {
        return false;
      }
    }

    return {
      init: init,
      isIOS: isIOS,
      isTablet: isTablet,
      isDesktop: isDesktop,
      lightVersion: lightVersion
    }

  })();

  // END DETECT DEVICE  ==========================================================
  var doc = $(document),
    wind = $(window),
    loader = $('.global--loader').first(),
    windowHeight = wind.height(),
    windowWidth = wind.width(),
    pageLoaded = false,
    imagesLoaded = 0;
    imagesToLoad = $('<img />').length,
    imagesLoadingProgress = 0;
    // uiBlocked = false;
    uiBlocked = true;
    siteIsLoading = true,
    switchWait = false,
    close = $('.close:first'),
    map = $('.map--container');
    mouseOverWait = false,
    waitMap = false,
    waitScroll = false;
    target = null;


  var globalSite = (function() {

    var init = function() {
      bindEvents();
      pageInit();
      contentLoading();
      device.init();

      addImageBackgroundToCanvas();

      // setCanvasToHidden();
    }

    var pageInit = function() {
      $('html, body').animate({
        scrollTop: 0
      }, 0);
      initScrollAnimation();
      initMap();

      var container = $('.scroll--container');
      container.css({
        transform: 'transform3d(0,0,0)'
      });
    }


    var contentLoading = function() {
      intro();
      var container = $('.page--container').first();
      pictures = container.find('.picture--wrapper .picture');
      pictures.each(function() {
        var picture = $(this);
        picture.imagesLoaded()
          .done(function(instance) {
            pageLoaded = true;
            setImageAsBackground(picture);
          })
          .fail(function() {
            pageLoaded = false;
            setTimeOut(function() {
              contentLoading();
            }, 100);
          });
      });
    }


    var setImageAsBackground = function(parent) {
      var image = parent.find('img');
      parent.css({
        backgroundImage: 'url("' + image.attr('src') + '")'
      });

      if (!image.hasClass('not--hide')) {
        image.hide().remove();
      }
    }

    var initScrollAnimation = function() {
      var controller = new ScrollMagic.Controller({
        addIndicators: false
      });

      $('.page--container:first .scroll--reveal').each(function() {
        var element = $(this);
        var scene = new ScrollMagic.Scene({
          triggerHook: 0.75,
          triggerElement: element.get(0),
          reverse: false
        });

        scene.on('start', function(e) {
          if (e.scrollDirection != 'REVERSE') {
            element.trigger('reveal');
            scene.remove();
          }
        });

        scene.addTo(controller);
      });

    }


    var bindEvents = function() {
      // $(window).on('resize orientationchange', resizeHandler);
      // $('body').on('reveal', '.scroll--reveal', scrollRevealHandler);
      // Mousewwheel vertical nav
      $(document).on('mousewheel', verticalNav);
      $('body').on('click', 'a.here--map', openMap);

      $('body').on('click', '.close', closeMap);

      $('body').on('mouseover', '.feature--projects li a', toggleCanvas);

      $('body').on('mouseenter', 'a', viewIn);
      $('body').on('mouseleave', 'a', viewOut);
    }

    var viewIn = function() {
      var element = $(this),
        span = element.find('span:first');
      span.addClass('enter').removeClass('leave');
    }

    var viewOut = function() {
      var element = $(this),
        span = element.find('span:first');
      span.addClass('leave').removeClass('enter');
    }

    var openMap = function(e) {
      if (waitMap)
        return;
      waitMap = true;
      uiBlocked = true;

      if (e.target.tagName != 'a') {
        var link = e.target.parentNode,
          parents = $(link).closest('.wrapper'),
          elements = parents.find('.text--wrapper, ul.social li a'),
          adress = map.find('.adress');

        close.css({
          display: 'block'
        });

        var tl = new TimelineLite();

        tl.pause();

        tl.staggerTo(elements, .8, {
          opacity: 0,
          x: -30,
          ease: Power3.easeOut
        }, 0, 0);

        tl.fromTo(map.find('.mask'), .4, {
          left: '100%',
          x: 60
        }, {
          left: 0,
          x: 0,
          ease: Expo.easeOut
        }, 0.3);

        tl.fromTo(map.find('.ggmap'), 2, {
          opacity: 0,
          x: 20
        }, {
          opacity: 1,
          x: 0,
          ease: Expo.easeOut
        }, .9);


        tl.staggerFromTo(map.find('.mask'), .4, {
          right: 0
        }, {
          right: '100%',
          ease: Expo.easeOut
        }, 0.2, .8);

        tl.to(adress.find('.adress--bg'), .4, {
          right: 0,
          ease: Expo.easeOut
        }, 1.2);

        tl.staggerFromTo(adress.find('.text--wrapper'), .6, {
          opacity: 0,
          x: 20
        }, {
          opacity: 1,
          x: 0,
          ease: Expo.easeOut
        }, 0.07, 1.6);

        tl.to(close, .3, {
          opacity: 1,
          ease: Sine.easeOut
        }, 1);

        tl.call(function() {

          map.css({
            pointerEvents: 'auto'
          });

          map.find('.mask').css({
            left:'100%',
            right:0
          });

          waitMap = false;

        });

        tl.play();

      }

    }


    var closeMap = function(e){
      if (waitMap)
        return;

      waitMap = true;
      if (e.target.className != '.close') {
        var link = $(this),
            wrapper = link.next('.wrapper:first'),
            elements = wrapper.find('.text--wrapper, ul.social li a'),
            adress = map.find('.adress');

        map.css({
          pointerEvents:'none'
        });

        var tl  = new TimelineLite();
        tl.pause();

        tl.to(close, .2, {
          opacity:0,
          ease:Expo.easeOut
        },0);

        tl.staggerTo(adress.find('.text--wrapper').reverse(), .6, {
          opacity: 0,
          x: 20,
          ease: Expo.easeOut
        }, 0.1, 0);

        tl.to(adress.find('.adress--bg'), .4, {
          left: '100%',
          ease: Expo.easeOut
        },0.7);

        tl.to(map.find('.ggmap'), 1, {
          opacity: 0,
          x: 20,
          ease: Expo.easeOut
        }, .8);

        tl.fromTo(map.find('.mask'), .4, {
          right: '100%',
          x:-60
        }, {
          right: 0,
          x: 0,
          ease: Expo.easeOut
        },1);

        tl.fromTo(map.find('.mask'), .4, {
          left: 0
        }, {
          left: "100%",
          ease: Expo.easeOut
        }, 1.6);

        tl.staggerTo(elements, .8, {
          opacity: 1,
          x: 0,
          ease: Expo.easeOut
        }, 0.05, 1.8);


        tl.call(function(){
          close.add(map).css({
            pointerEvents:''
          });

          adress.find('.text--wrapper').css({
            opacity:'',
            transform:''
          });

          adress.find('.mask').css({
            right:'',
            left:''
          });

          adress.find('.adress--bg').css({
            right:'',
            left:''
          });

          uiBlocked = false;

          waitMap = false;

        });

        tl.play();

      }
    }


    var goNextSection = function(next) {
      var container = $('.page--container'),
        sections = container.find('section.fullwidth'),
        activeSection = sections.filter('.is--active');


      if (next) {
        var nextSection = activeSection.next('section.fullwidth');
        // if (nextSection.length == 0)
        //   nextSection = sections.first();

      } else {
        var nextSection = activeSection.prev('section.fullwidth');
        // if (nextSection.length == 0)
        //   nextSection = sections.last();
      }

      if (nextSection.length == 1) {
        switchSection(nextSection);
      }
    }

    var switchSection = function(nextSection) {
      var container = $('.page--container'),
        sections = container.find('section.fullwidth'),
        activeSection = sections.filter('.is--active');

      if (waitScroll)
        return;

      waitScroll = true;

      if (!device.lightVersion()) {
        if (nextSection.length == 0 || nextSection.hasClass('is--active'))
          return;

        nextSection.css({
          zIndex: 60,
          opacity:0,
          top:0,
          left: 0
        });

        if (nextSection.is('.intro')) {
          var text = nextSection.find('.text--wrapper');

          text.css({
            opacity: 0
          });

          var tl = new TimelineLite(),
              start = 0.5;

          tl.pause();

          tl.to(nextSection, .3, {
            opacity:1,
            ease:Expo.easeOut
          },start);

          tl.staggerFromTo(text, .8, {
            opacity:0,
            y:20
          },{
            opacity:1,
            y:0,
            ease:Expo.easeOut
          },0.04,start+.2);


          tl.call(function(){

            nextSection.css({
              zIndex:'',
              top:'',
              left:'',
              opacity:''
            });
            activeSection.removeClass('is--active');
            nextSection.addClass('is--active');

            text.css({
              opacity:'',
              transform:''
            });

            waitScroll = false;

          });

          tl.play();


        } else if (nextSection.is('.projects')) {
          var list = nextSection.find('ul.feature--projects li a'),
              elements = nextSection.find('.page--title, svg');

          elements.css({
            opacity: 0
          });

          list.css({
            opacity: 0
          });

          var tl = new TimelineLite(),
              start = 0.5;

          tl.pause();

          tl.to(nextSection, .3, {
            opacity:1,
            ease:Expo.easeOut
          },start);

          tl.staggerFromTo(list, .8, {
            opacity:0,
            x:-30
          },{
            opacity:1,
            x:0,
            ease:Expo.easeOut
          },0.05,start+.3);

          tl.staggerFromTo(elements, .6, {
            cycle: {
              x:[-20,20]
            },
            opacity:0
          },{
            x:0,
            opacity:1,
            ease:Expo.easeOut
          },0.05,start+.5);


          tl.call(function(){

            nextSection.css({
              zIndex:'',
              top:'',
              left:'',
              opacity:''
            });

            activeSection.removeClass('is--active');
            nextSection.addClass('is--active');

            waitScroll = false;
          });


          tl.play();


        } else if (nextSection.is('.contact')) {
          var text = nextSection.find('h1 .text--wrapper').reverse(),
            list = nextSection.find('ul.social li a');

          list.css({
            opacity: 0
          });

          text.css({
            opacity: 0
          });

          var tl = new TimelineLite(),
              start = 0.5;
          tl.pause();

          tl.to(nextSection, .3, {
            opacity:1,
            ease:Expo.easeOut
          },start);

          tl.staggerFromTo(text, .6, {
            cycle:{
              x:[-20,20]
            },
            opacity:0,
          },{
            opacity:1,
            x:0,
            ease:Expo.easeOut
          },0.05, start + .3);

          tl.staggerFromTo(list, .6, {
            opacity:0,
            y:20
          },{
            opacity:1,
            y:0,
            ease:Expo.easeOut
          },0.1,start + .3);


          tl.call(function(){

            list.css({
              opacity:'',
              transform:''
            });

            text.css({
              opacity:'',
              transform:''
            });

            nextSection.css({
              zIndex:'',
              top:'',
              left:'',
              opacity:''
            });
            activeSection.removeClass('is--active');
            nextSection.addClass('is--active');

            waitScroll = false;

          });

          tl.play();

        }

        // ANIMATION OUT

        if (activeSection.is('.intro')) {
          var text = activeSection.find('.text--wrapper').reverse(),
            tl = new TimelineLite();
          tl.pause();

          tl.staggerTo(text, .6, {
            opacity: 0,
            y: 20,
            ease: Expo.easeInOut
          }, 0.04, 0);

          tl.to(activeSection, .3, {
            opacity: 0,
            ease: Expo.easeInOut
          }, 0.5);

          tl.play();

          tl.call(function() {

            text.css({
              opacity: '',
              transform: ''
            });

            activeSection.css({
              opacity: ''
            });

            activeSection.removeClass(('is--active'));
          });

        } else if (activeSection.is('.projects')) {
          var elements = activeSection.find('svg, .page--title'),
            list = activeSection.find('.feature--projects li a');

          list.css({
            display: 'inline-block'
          });

          var tl = new TimelineLite();
          tl.pause();

          tl.staggerTo(elements, .6, {
            cycle: {
              x: [-20, 20]
            },
            opacity: 0,
            ease: Expo.easeOut
          }, 0);

          tl.staggerTo(list, .6, {
            opacity: 0,
            x: -20,
            ease: Expo.easeOut
          }, 0.07, 0);

          tl.to(activeSection, .3, {
            opacity: 0,
            ease: Expo.easeInOut
          }, 0.4);

          tl.call(function() {

            list.css({
              opacity: '',
              transform: ''
            });

            elements.css({
              opacity: '',
              transform: ''
            });

            activeSection.css({
              opacity: ''
            });

            // activeSection.removeClass(('is--active'));
          });

          tl.play();

        } else if (activeSection.is('.contact')) {
          var text = activeSection.find('.text--wrapper'),
              list = activeSection.find('ul.social li a').reverse(),
              tl = new TimelineLite();
              tl.pause();

          tl.staggerTo(text, .6, {
            opacity: 0,
            cycle:{
              x:[-20,20]
            },
            ease: Expo.easeInOut
          }, 0.07, 0);

          tl.staggerTo(list, .6, {
            opacity:0,
            y:20,
            ease: Expo.easeInOut
          }, 0.07, 0);

          tl.to(activeSection, .3, {
            opacity: 0,
            ease: Expo.easeInOut
          }, 4);

          tl.call(function() {

            text.css({
              opacity: '',
              transform: ''
            });

            list.css({
              opacity:'',
              transform:''
            });

            activeSection.css({
              opacity: ''
            });
            // activeSection.removeClass('is--active');
          });

          tl.play();
        }
      }
    }

    var verticalNav = function(e) {

      if (uiBlocked)
        return;

      var container = $('.page--container'),
        sections = container.find('section.fullwidth'),
        activeSection = sections.filter('.is--active'),
        down = null;

      if (e.type == 'mousewheel') {
        down = (e.deltaY != 1);
      } else if (e.type == 'keyup') {
        if (e.which == 40) {
          down = true;
        } else if (e.which == 38) {
          down = false;
        }
      } else if(e.type='swipe'){
        if (direction =='down') {
          down = true;
        } else if(direction =='up'){
          down = false;
        } else if(direction =='right' || drection == 'left'){
          return;
        }
      }

      if (down == null)
        return;

      goNextSection(down);

    }

    var showPreLoader = function() {

      var tl = new TimelineLite();

      tl.to(loader.find('.line--wrapper'), .3, {
        opacity:1,
        ease:Sine.easeInOut
      },0);

      tl.to(loader.find('.line--wrapper .line'), 2, {
        right:0,
        ease:Sine.easeInOut
      },0);


      $(window).on('load', siteIsLoaded);

      tl.call(function(){
        init();
      },null,null, 1.5);


    }




    var intro = function(){

      var tl = new TimelineLite();
      tl.pause();

      tl.to(loader.find('.line--wrapper'), .3, {
        opacity:0,
        ease:Sine.easeInOut
      },0);

      tl.to(loader, .3, {
        opacity:0,
        ease:Sine.easeInOut
      },0.3);

      tl.call(function(){
        loader.hide();
        loader.remove();

        uiBlocked = false;
      });

      tl.play();
    }

    var siteIsLoaded = function() {
      $(window).trigger('resize');
      siteIsLoading = false;
    }

    var addImageBackgroundToCanvas = function(){
      var imgArray = ['project--image--1.jpg','project--image--2.jpg','project--image--3.jpg','project--image--4.jpg', 'project--image--5.jpg'],
          canvas = $('section.projects .image');

      imgArray.forEach(function(value, index){
        TweenMax.set(canvas[index], {
          backgroundImage: 'url("./assets/projects/' + imgArray[index] + '")'
        });
        $(canvas[index]).attr('data--image', 'projects/'+ imgArray[index] );
      });

    }

    var toggleCanvas = function(e){
       if (mouseOverWait)
         return;

       var mouseOverWait = true;

       var link = $(this),
           linkData = link.attr('data--image'),
           linkPath =  linkData,
           parents = link.parents('ul.feature--projects'),
           canvas = parents.siblings('.image'),
           target = canvas.filter(function() {
             return $(this).attr('data--image') == linkPath
           }),

           all = canvas.not(target);

           if (target.data('busy') == true)
             return;

           canvas.data('busy', false);
           target.data('busy', true);

           TweenMax.set(target, {
             zIndex:2,
             visibility:'inherit'
           });

           tl = new TimelineLite(),
           start = 0;
           tl.pause();

           tl.fromTo(target, .6, {
             opacity:0
           },{
             opacity:1,
             rotation:'-25deg',
             ease:Expo.easeOut
           },start);

           tl.to(all, .6, {
             opacity:0,
             ease:Expo.easeOut
           },start+.1);

           tl.call(function(){
             mouseOverWait = false;

             all.css({
               visibility:'hidden',
               zIndex:1,
               opacity:0
             });

           });

           tl.play();

     }





    var initMap = function() {
      var container = $('.page--container section.contact .map--container'),
        mapContainer = container.find('.ggmap');
      // initialize once only by settig data
      if (mapContainer.data('map') != undefined)
        return;



      var styles = [{
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [{
              "saturation": 36
            },
            {
              "color": "#000000"
            },
            {
              "lightness": 40
            }
          ]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#000000"
            },
            {
              "lightness": 16
            }
          ]
        },
        {
          "featureType": "all",
          "elementType": "labels.icon",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry.fill",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 20
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 17
            },
            {
              "weight": 1.2
            }
          ]
        },
        {
          "featureType": "landscape",
          "elementType": "geometry",
          "stylers": [{
              "color": "#171718"
            },
            {
              "lightness": "0"
            },
            {
              "visibility": "on"
            },
            {
              "gamma": "1"
            },
            {
              "weight": "0.01"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 21
            }
          ]
        },
        {
          "featureType": "poi.business",
          "elementType": "geometry",
          "stylers": [{
            "color": "#313133"
          }]
        },
        {
          "featureType": "poi.government",
          "elementType": "geometry",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#313133"
            }
          ]
        },
        {
          "featureType": "poi.medical",
          "elementType": "geometry",
          "stylers": [{
              "color": "#313133"
            },
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{
            "color": "#313133"
          }]
        },
        {
          "featureType": "poi.place_of_worship",
          "elementType": "geometry",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#313133"
            }
          ]
        },
        {
          "featureType": "poi.school",
          "elementType": "geometry",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#313133"
            }
          ]
        },
        {
          "featureType": "poi.sports_complex",
          "elementType": "geometry",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#313133"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 17
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 29
            },
            {
              "weight": 0.2
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [{
            "color": "#212123"
          }]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [{
              "color": "#101012"
            },
            {
              "lightness": "12"
            },
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [{
            "color": "#747476"
          }]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.stroke",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#171718"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "geometry",
          "stylers": [{
              "color": "#101012"
            },
            {
              "lightness": "8"
            },
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "geometry",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 19
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [{
              "visibility": "on"
            },
            {
              "color": "#2b2b30"
            }
          ]
        },
        {
          "featureType": "transit.station.airport",
          "elementType": "geometry",
          "stylers": [{
            "color": "#313133"
          }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{
              "color": "#000000"
            },
            {
              "lightness": 17
            },
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [{
            "color": "#242426"
          }]
        }
      ];



      var mapCenter = new google.maps.LatLng(mapContainer.attr('data--lat'), mapContainer.attr('data--lng')),
        mapOptions = {
          center: mapCenter,
          zoom: 17,
          styles: styles,
          streetViewControl: false,
          mapTypeControl: false,
          scrollwheel: true
        },
        map = new google.maps.Map(
          mapContainer.get(0),
          mapOptions
        );

      marker = new google.maps.Marker({
        position: mapCenter,
        map: map,
        icon: {
          url: '/assets/marker.png',
          size: new google.maps.Size(31, 48),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(6, 20)
        }
      });

      // Go to google map
      marker.addListener('click', function() {
        window.open(mapContainer.attr('data--link'));
      });

      mapContainer.data('map', map);
      mapContainer.data('mapCenter', mapCenter);
      // resizeMap();


    }

    return {
      showPreLoader: showPreLoader,
      init: init
    }

  })();

  globalSite.showPreLoader();
