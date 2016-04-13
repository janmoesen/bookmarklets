( function ( $ ) {

	$( document ).on( 'ready' + rlArgs.customEvents, function () {

		// initialise event
		$.event.trigger( {
			type		: 'doResponsiveLightbox',
			script		: rlArgs.script,
			selector	: rlArgs.selector,
			args		: rlArgs
		} );

	} );

	// this is similar to the WP function add_action();
	$( document ).on( 'doResponsiveLightbox', function( event ) {

    	var script 		= event.script,
    		selector 	= event.selector
    		args 		= event.args;

    	if ( typeof script === 'undefined' || typeof selector === 'undefined' ) {
    		return false;
    	}

    	switch( script ) {

    		case 'swipebox':

				$( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ).swipebox( {
					useCSS						: ( rlArgs.animation === '1' ? true : false ),
					useSVG						: ( rlArgs.useSVG === '1' ? true : false ),
					hideCloseButtonOnMobile		: ( rlArgs.hideCloseButtonOnMobile === '1' ? true : false ),
					removeBarsOnMobile			: ( rlArgs.removeBarsOnMobile === '1' ? true : false ),
					hideBarsDelay				: ( rlArgs.hideBars === '1' ? parseInt( rlArgs.hideBarsDelay ) : 0 ),
					videoMaxWidth				: parseInt( rlArgs.videoMaxWidth ),
					loopAtEnd					: ( rlArgs.loopAtEnd === '1' ? true : false )
				} );

				break;

			case 'prettyphoto':

				$( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ).prettyPhoto( {
					hook						: 'data-rel',
					animation_speed				: rlArgs.animationSpeed,
					slideshow					: ( rlArgs.slideshow === '1' ? parseInt( rlArgs.slideshowDelay ) : false ),
					autoplay_slideshow			: ( rlArgs.slideshowAutoplay === '1' ? true : false ),
					opacity						: rlArgs.opacity,
					show_title					: ( rlArgs.showTitle === '1' ? true : false ),
					allow_resize				: ( rlArgs.allowResize === '1' ? true : false ),
					allow_expand				: ( rlArgs.allowExpand === '1' ? true : false ),
					default_width				: parseInt( rlArgs.width ),
					default_height				: parseInt( rlArgs.height ),
					counter_separator_label		: rlArgs.separator,
					theme						: rlArgs.theme,
					horizontal_padding			: parseInt( rlArgs.horizontalPadding ),
					hideflash					: ( rlArgs.hideFlash === '1' ? true : false ),
					wmode						: rlArgs.wmode,
					autoplay					: ( rlArgs.videoAutoplay === '1' ? true : false ),
					modal						: ( rlArgs.modal === '1' ? true : false ),
					deeplinking					: ( rlArgs.deeplinking === '1' ? true : false ),
					overlay_gallery				: ( rlArgs.overlayGallery === '1' ? true : false ),
					keyboard_shortcuts			: ( rlArgs.keyboardShortcuts === '1' ? true : false ),
					social_tools				: ( rlArgs.social === '1' ? '<div class="pp_social"><div class="twitter"><a href="//twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="//platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href=' + location.href + '&amp;layout=button_count&amp;show_faces=true&amp;width=500&amp;action=like&amp;font&amp;colorscheme=light&amp;height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div></div>' : '' ),
					changepicturecallback		: function () {
					},
					callback					: function () {
					},
					ie6_fallback				: true
				} );

				break;

			case 'fancybox':

				$( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ).fancybox( {
					modal						: ( rlArgs.modal === '1' ? true : false ),
					overlayShow					: ( rlArgs.showOverlay === '1' ? true : false ),
					showCloseButton				: ( rlArgs.showCloseButton === '1' ? true : false ),
					enableEscapeButton			: ( rlArgs.enableEscapeButton === '1' ? true : false ),
					hideOnOverlayClick			: ( rlArgs.hideOnOverlayClick === '1' ? true : false ),
					hideOnContentClick			: ( rlArgs.hideOnContentClick === '1' ? true : false ),
					cyclic						: ( rlArgs.cyclic === '1' ? true : false ),
					showNavArrows				: ( rlArgs.showNavArrows === '1' ? true : false ),
					autoScale					: ( rlArgs.autoScale === '1' ? true : false ),
					scrolling					: rlArgs.scrolling,
					centerOnScroll				: ( rlArgs.centerOnScroll === '1' ? true : false ),
					opacity						: ( rlArgs.opacity === '1' ? true : false ),
					overlayOpacity				: parseFloat( rlArgs.overlayOpacity / 100 ),
					overlayColor				: rlArgs.overlayColor,
					titleShow					: ( rlArgs.titleShow === '1' ? true : false ),
					titlePosition				: rlArgs.titlePosition,
					transitionIn				: rlArgs.transitions,
					transitionOut				: rlArgs.transitions,
					easingIn					: rlArgs.easings,
					easingOut					: rlArgs.easings,
					speedIn						: parseInt( rlArgs.speeds ),
					speedOut					: parseInt( rlArgs.speeds ),
					changeSpeed					: parseInt( rlArgs.changeSpeed ),
					changeFade					: parseInt( rlArgs.changeFade ),
					padding						: parseInt( rlArgs.padding ),
					margin						: parseInt( rlArgs.margin ),
					width						: parseInt( rlArgs.videoWidth ),
					height						: parseInt( rlArgs.videoHeight )
				} );

				break;

			case 'nivo':

				$.each( $( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ), function () {
					var attr = $( this ).attr( 'data-rel' );

					// check data-rel attribute first
					if ( typeof attr === 'undefined' || attr == false ) {
						// if not found then try to check rel attribute for backward compatibility
						attr = $( this ).attr( 'rel' );
					}

					// for some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
					if ( typeof attr !== 'undefined' && attr !== false ) {
						var match = attr.match( new RegExp( rlArgs.selector + '\\-(gallery\\-(?:[\\da-z]{1,4}))', 'ig' ) );

						if ( match !== null ) {
							$( this ).attr( 'data-lightbox-gallery', match[0] );
						}
					}

				} );

				$( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ).nivoLightbox( {
					effect						: rlArgs.effect,
					clickOverlayToClose			: ( rlArgs.clickOverlayToClose === '1' ? true : false ),
					keyboardNav					: ( rlArgs.keyboardNav === '1' ? true : false ),
					errorMessage				: rlArgs.errorMessage
				} );

				break;

			case 'imagelightbox':

				var selectors = [];

				$( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ).each( function ( i, item ) {
					var attr = $( item ).attr( 'data-rel' );

					// check data-rel attribute first
					if ( typeof attr !== 'undefined' && attr !== false && attr !== 'norl' )
						selectors.push( attr );
					// if not found then try to check rel attribute for backward compatibility
					else {
						attr = $( item ).attr( 'rel' );

						if ( typeof attr !== 'undefined' && attr !== false && attr !== 'norl' )
							selectors.push( attr );
					}
				} );

				if ( selectors.length > 0 ) {

					// make unique
					selectors = $.unique( selectors );

					$( selectors ).each( function ( i, item ) {
						$( 'a[data-rel="' + item + '"], a[rel="' + item + '"]' ).imageLightbox( {
							animationSpeed		: parseInt( rlArgs.animationSpeed ),
							preloadNext			: ( rlArgs.preloadNext === '1' ? true : false ),
							enableKeyboard		: ( rlArgs.enableKeyboard === '1' ? true : false ),
							quitOnEnd			: ( rlArgs.quitOnEnd === '1' ? true : false ),
							quitOnImgClick		: ( rlArgs.quitOnImageClick === '1' ? true : false ),
							quitOnDocClick		: ( rlArgs.quitOnDocumentClick === '1' ? true : false )
						} );
					} );
				}

				break;

			case 'tosrus':

				var selectors = [];

				$( 'a[rel*="' + rlArgs.selector + '"], a[data-rel*="' + rlArgs.selector + '"]' ).each( function ( i, item ) {
					var attr = $( item ).attr( 'data-rel' );

					// check data-rel attribute first
					if ( typeof attr !== 'undefined' && attr !== false && attr !== 'norl' )
						selectors.push( attr );
					// if not found then try to check rel attribute for backward compatibility
					else {
						attr = $( item ).attr( 'rel' );

						if ( typeof attr !== 'undefined' && attr !== false && attr !== 'norl' )
							selectors.push( attr );
					}
				} );

				if ( selectors.length > 0 ) {

					// make unique
					selectors = $.unique( selectors );

					$( selectors ).each( function ( i, item ) {
						$( 'a[data-rel="' + item + '"], a[rel="' + item + '"]' ).tosrus( {
							infinite			: ( rlArgs.infinite === '1' ? true : false ),
							autoplay				: {
								play				: ( rlArgs.autoplay === '1' ? true : false ),
								pauseOnHover		: ( rlArgs.pauseOnHover === '1' ? true : false ),
								timeout 			: rlArgs.timeout
							},
							effect					: rlArgs.effect,
							keys					: {
								prev					: ( rlArgs.keys === '1' ? true : false ),
								next					: ( rlArgs.keys === '1' ? true : false ),
								close					: ( rlArgs.keys === '1' ? true : false )
							},
							pagination				: {
								add						: ( rlArgs.pagination === '1' ? true : false ),
								type					: rlArgs.paginationType
							},
							// forced
							show					: false,
							buttons					: true,
							caption					: {
								add						: true,
								attributes				: ["title"]
							}
						} );
					} );
				}

				break;
		}

	} );

} )( jQuery );