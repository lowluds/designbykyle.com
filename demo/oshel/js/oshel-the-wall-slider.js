/*
1. timing Function
2. carousels
  2-1. home page subtitle carousel
  2-2. testimonials carousel
  2-3. news carousel
  2-3. about section images carousel
3. scrollTo
4. scrollToTop
5. preloader
6. parallax
7. facts counter
8. home fadeOut animation
9. contact form
10. YTPlayer
11. skills bar
12. menu active state
13. navigation - style #3
  13-1. height.Adjustment
  13-2. search form
  13-3. search form additional CLOSER
14. google maps POSITION
15. GOOGLE ANALYTICS [for demonstration purposes only]
16. the Wall
*/


$(function() {
    "use strict";


    // 1. timing Function
    var timingFunction = "easeInOutQuart";

    // 2. carousels
    // 2-1. home page subtitle carousel
    $(".home-page-subtitle-carousel").owlCarousel({
        loop: true,
        autoplay: true,
        autoplaySpeed: 1000,
        autoplayTimeout: 5000,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 1,
        margin: 0,
        center: true,
        dots: false,
        nav: false,
        touchDrag: false,
        mouseDrag: false,
        pullDrag: false,
        responsiveRefreshRate: 50
    });
    // 2-2. testimonials carousel
    $(".testimonials-carousel").owlCarousel({
        loop: true,
        autoplay: true,
        autoplaySpeed: 1000,
        autoplayTimeout: 5000,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 1,
        margin: 0,
        center: true,
        dots: false,
        nav: false,
        touchDrag: true,
        mouseDrag: true,
        pullDrag: true,
        responsiveRefreshRate: 50
    });
    // 2-3. news carousel
    $(".news-carousel").owlCarousel({
        loop: true,
        autoplay: true,
        autoplaySpeed: 1000,
        autoplayTimeout: 5000,
        items: 1,
        margin: 0,
        center: true,
        dots: false,
        nav: true,
        touchDrag: true,
        mouseDrag: true,
        pullDrag: true,
        responsiveRefreshRate: 50,
        navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
        autoplayHoverPause: true
    });
    // 2-4. about section images carousel
    $(window).on("resize", function() {
        if ($(window).width() < 1024) {
            $(".about-section-images-carousel").owlCarousel({
                loop: true,
                autoplay: true,
                autoplaySpeed: 1000,
                autoplayTimeout: 5000,
                items: 1,
                margin: 0,
                center: true,
                dots: false,
                nav: true,
                touchDrag: true,
                mouseDrag: true,
                pullDrag: true,
                responsiveRefreshRate: 50,
                navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"]
            });
        } else {
            $(".about-section-images-carousel").trigger("destroy.owl.carousel");
        }
    }).trigger("resize");

    // 3. scrollTo
    $("[data-scroll-to]").on("click", function(e) {
        e.preventDefault();
        var scroll_element = "#" + $(this).data("scroll-to");
        var scrollOffset = $(scroll_element).offset().top;
        $("html, body").animate({
            scrollTop: scrollOffset
        }, 1400, timingFunction);
    });

    // 4. scrollToTop
    $(".scrollToTop").on("click", function() {
        $("html, body").animate({
            scrollTop: 0
        }, 1400, timingFunction);
    });

    // 5. preloader - Fixed to prevent hanging
    $(document).ready(function() {
        // Hide preloader after a reasonable delay to ensure page is interactive
        setTimeout(function() {
            $("#preloader").fadeOut(400, timingFunction);
        }, 800); // 800ms delay after DOM ready
    });

    // Fallback: ensure preloader is hidden after 5 seconds regardless
    setTimeout(function() {
        $("#preloader").fadeOut(300, timingFunction);
    }, 5000);

    // 6. parallax
    $(".parallax-window").parallax(10);

    // 7. facts counter
    $(".facts-counter-number").appear(function() {
        var count = $(this);
        count.countTo({
            from: 0,
            to: count.html(),
            speed: 1200,
            refreshInterval: 60
        });
    });

    // 8. home fadeOut animation
    $(window).on("scroll", function() {
        $("h1.home-page-title, h2.home-page-title, h3.home-page-title, .play-video-btn").css("opacity", 1 - $(window).scrollTop() / $(".hero-fullscreen, #viewport").height());
    });

    // 9. contact form
    $("form#form").on("submit", function() {
        $("form#form .error").remove();
        var s = !1;
        if ($(".requiredField").each(function() {
                if ("" === jQuery.trim($(this).val())) $(this).prev("label").text(), $(this).parent().append('<span class="error">This field is required</span>'), $(this).addClass(
                    "inputError"), s = !0;
                else if ($(this).hasClass("email")) {
                    var r = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                    r.test(jQuery.trim($(this).val())) || ($(this).prev("label").text(), $(this).parent().append('<span class="error">Invalid email address</span>'), $(this).addClass(
                        "inputError"), s = !0);
                }
            }), !s) {
            $("form#form input.submit").fadeOut("normal", function() {
                $(this).parent().append("");
            });
            var r = $(this).serialize();
            $.post($(this).attr("action"), r, function() {
                $("form#form").slideUp("fast", function() {
                    $(this).before('<div class="success">Your email was sent successfully.</div>');
                });
            });
        }
        return !1;
    });

    // 10. YTPlayer
    $("#background-video").YTPlayer({
        videoId: "3S9rxiz1lsU", // DEMO URL is: https://www.youtube.com/watch?v=3S9rxiz1lsU
        mute: true,             // options: true, false
        pauseOnScroll: false,
        repeat: true,
        fitToBackground: true,
        playerVars: {
            modestbranding: 0,
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            wmode: "transparent",
            branding: 0,
            rel: 0,
            autohide: 0
        }
    });

    // 11. skills bar
    $(".show-skillbar").appear(function() {
        $(".skillbar").skillBars({
            from: 0,
            speed: 4000,
            interval: 100,
            decimals: 0
        });
    });

    // 12. menu active state
    $(".menu-state, .link-underline").on("click", function() {
        $(".menu-state, .link-underline").removeClass("active");
        $(this).addClass("active");
    });

    // 13. navigation - style #3
    if ($(".main-navigation").hasClass("transparent")) {
        $(".main-navigation").addClass("js-transparent");
    }
    $(window).on("scroll", function() {
        if ($(window).scrollTop() > 10) {
            $(".js-transparent").removeClass("transparent");
            $(".main-navigation, .main-navigation-logo .main-navigation-logo-img").addClass("reduce-height");
        } else {
            $(".js-transparent").addClass("transparent");
            $(".main-navigation, .main-navigation-logo .main-navigation-logo-img").removeClass("reduce-height");
        }
    });
    // 13-1. height.Adjustment
    function heightAdjustment(heightSecondary, heightPrimary) {
        heightSecondary.height(heightPrimary.height());
        heightSecondary.css({
            "line-height": heightPrimary.height() + "px"
        });
    }
    heightAdjustment($(".main-inner-navigation > ul > li > a"), $(".main-navigation"));
    // 13-2. search form
    $(".search-modal-launcher").on("click", function() {
        if ($(".search-modal").hasClass("open")) {
            $(".search-modal").removeClass("open");
            $(".search-modal").addClass("close");
        } else {
            $(".search-modal").removeClass("close");
            $(".search-modal").addClass("open");
        }
    });
    // 13-3. search form additional CLOSER
    $(".main-navigation-logo, .link-underline").on("click", function() {
        $(".search-modal").removeClass("open");
        $(".search-modal").addClass("close");
    });




});


// 15. GOOGLE ANALYTICS [for demonstration purposes only]
// intentionally REMOVED!


// 16. the Wall - Simplified for CSS filter transitions
window.addEvent("domready", function() {
    var imagewall = [
        "img/the-wall/1.jpg",
        "img/the-wall/2.jpg",
        "img/the-wall/3.jpg",
        "img/the-wall/4.jpg",
        "img/the-wall/5.jpg",
        "img/the-wall/6.jpg",
        "img/the-wall/7.jpg",
        "img/the-wall/8.jpg",
        "img/the-wall/9.jpg",
        "img/the-wall/10.jpg",
        "img/the-wall/11.jpg",
        "img/the-wall/12.jpg",
        "img/the-wall/13.jpg",
        "img/the-wall/14.jpg",
        "img/the-wall/15.jpg",
        "img/the-wall/16.jpg",
        "img/the-wall/17.jpg",
        "img/the-wall/18.jpg",
        "img/the-wall/19.jpg",
        "img/the-wall/20.jpg",
        "img/the-wall/21.jpg",
        "img/the-wall/22.jpg",
        "img/the-wall/23.jpg",
        "img/the-wall/24.jpg",
        "img/the-wall/25.jpg",
        "img/the-wall/26.jpg",
        "img/the-wall/27.jpg",
        "img/the-wall/28.jpg",
        "img/the-wall/29.jpg",
        "img/the-wall/30.jpg",
        "img/the-wall/31.jpg",
        "img/the-wall/32.jpg",
        "img/the-wall/33.jpg",
        "img/the-wall/34.jpg",
        "img/the-wall/35.jpg",
        "img/the-wall/36.jpg",
        "img/the-wall/plus-1.jpg" // extra image to compensate for the gap
    ];
    var maxLength = 36;
    var wallFluid = new Wall("wall", {
        "draggable": true,
        "slideshow": false, // options: true, false
        "speed": 1000,
        "showDuration": 4000,
        "transition": Fx.Transitions.Quad.easeOut,
        "inertia": true,
        "autoposition": true,
        "width": 301,
        "height": 320,
        "rangex": [-100, 100],
        "rangey": [-100, 100],
        callOnUpdate: function(items) {
            var root = Math.ceil(Math.sqrt(maxLength));
            document.id("wall").setStyle("margin-left", 0);
            var i = 0;
            (function() {
                try {
                    var position = ((Math.abs(items[i].y) % root) * root) + (Math.abs(items[i].x) % root);
                    if (position >= imagewall.length) {
                        position = Math.floor(Math.random() * imagewall.length);
                    }
                    var file = imagewall[position];
                    // Create single image element with CSS class for filter transitions
                    var img = new Element("img", {
                        src: file,
                        class: "wall-image"
                    });
                    img.inject(items[i].node).fade("hide").fade("in");
                    i++;
                    if (i < items.length) {
                        var tmp = arguments.callee;
                        (function() {
                            tmp();
                        }).delay(10);
                    }
                } catch (e) {}
            })();
        }
    });
    window.setTimeout(function() {
        wallFluid.initWall();
    }, 500);
});
