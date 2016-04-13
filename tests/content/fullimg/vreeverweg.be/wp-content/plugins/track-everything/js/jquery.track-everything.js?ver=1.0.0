(function ($) {
	$.fn.track = function(options) {
		// Set defaults
		var defaults = {
			additional: [],
			dictionary: [],
			options: {
				forms: true,
				outbound: true,
				email: true,
				phone: true,
				anchor: true,
				universal: false,
				debug: false
			}
		};
		var settings = $.extend(true, {}, defaults, options );

		$.expr[':'].external = function(obj){
			return !obj.href.match(/^mailto:/) && !obj.href.match(/^tel:/) && !obj.href.match(/^#/) && (obj.hostname.replace(/^www\./i, '') != document.location.hostname.replace(/^www\./i, ''));
		};

		var calculateLabel = function ($obj, possibilities){
			var possibilities = (typeof possibilities == 'object') ? possibilities : ["data-track-everything-name", "name", "title", "id"];
			var eventLabel = null;
			for (var i = 0; i <= (possibilities.length - 1); i++) {
				var possibility = $obj.attr(possibilities[i]);
				if(possibility && possibility.length){
					eventLabel = possibility;
					break;
				}
			}
			return eventLabel;
		},

		pushEvent = function ( eventInfo ) {
			if(settings.options.debug){ console.log(eventInfo); }
			if(settings.options.universal){
				var gauEventInfo = {
					'hitType': 'event',
					'eventCategory': eventInfo[1],
					'eventAction': eventInfo[2]
				};
				if(eventInfo[3]){
					gauEventInfo['eventLabel'] = eventInfo[3];
				}
				if(eventInfo[4]){
					gauEventInfo['eventValue'] = eventInfo[4];
				}
				if(eventInfo[5]){
					gauEventInfo['nonInteraction'] = Number(eventInfo[4]);
				}

				try {
					ga('send', gauEventInfo);
				} catch (e) {
					if(settings.options.debug){
						console.log("Google Analytics must be installed and initiated for Track Everything to work");
					}
				}

			}else{

				try {
					_gaq.push(eventInfo);
				} catch (e) {
					if(settings.options.debug){
						console.log("Google Analytics must be installed and initiated for Track Everything to work");
					}
				}

			}
		},

		trackSpecialLink = function (context, identifier, name) {
			var $special = $(context).find('a[href^="' + identifier + '"]');
			$special.on("click.track-everything.track-everything-default keypress.track-everything.track-everything-default", function (e) {
				var eventLabel = calculateLabel($(this), ["data-track-everything-name", "href"]);

				var elementHref = $(this).attr("href");

				if(eventLabel == elementHref){
					eventLabel = elementHref.substring(identifier.length);
				}

				var eventInfo = ['_trackEvent', 'Link', name , eventLabel];
				pushEvent(eventInfo);
			});
			if(settings.options.debug){
				$special.addClass("track-everything track-everything-default track-everything-" + name.toLowerCase());
			}
		};

		return this.each(function() {
			for (var i = settings.dictionary.length - 1; i >= 0; i--) {
				$(this).find(settings.dictionary[i].selector).attr("data-track-everything-name", settings.dictionary[i].name);
			}

			if(settings.options.forms){
				var $forms = $(this).find("form");
				$forms.on("submit.track-everything.track-everything-default", function (e) {
					var eventLabel = calculateLabel($(this));

					var eventInfo = ['_trackEvent', 'Form', 'Submission'];
					if(eventLabel !== null){
						eventInfo.push(eventLabel);
					}
					pushEvent(eventInfo);
				});
				if(settings.options.debug){
					$forms.addClass("track-everything track-everything-default track-everything-form");
				}
			}

			if(settings.options.outbound){
				var $outbound = $(this).find("a:external");
				$outbound.on("click.track-everything.track-everything-default keypress.track-everything.track-everything-default", function (e) {
					var eventLabel = calculateLabel($(this), ["data-track-everything-name", "href"]);

					var eventInfo = ['_trackEvent', 'Link', 'Outbound', eventLabel, null, true];
					pushEvent(eventInfo);
				});
				if(settings.options.debug){
					$outbound.addClass("track-everything track-everything-default track-everything-outbound");
				}
			}

			if(settings.options.email){
				trackSpecialLink(this, "mailto:", "Email");
			}

			if(settings.options.phone){
				trackSpecialLink(this, "tel:", "Phone");
			}

			if(settings.options.anchor){
				trackSpecialLink(this, "#", "Anchor");
			}

			var context = this;

			$.each(settings.additional, function (i, additional){
				var $additional = $(context).find(additional.selector);
				$additional.off(".track-everything-default");
				if(settings.options.debug){
					$additional.addClass("track-everything track-everything-additional").removeClass("track-everything-default");
				}
				var events = [];
				for (var j = additional.events.length - 1; j >= 0; j--) {
					events.push(additional.events[j] + ".track-everything.track-everything-additional");
				}
				$additional.on(events.join(" "), function () {
					if(additional.name.length){
						$(this).attr("data-track-everything-override", additional.name);
					}
					var eventLabel = calculateLabel($(this), ["data-track-everything-override", "data-track-everything-name", "name", "title", "id", "href"]);
					var eventInfo = ['_trackEvent', additional.category, additional.action, eventLabel];
					
					pushEvent(eventInfo);
				});
			});
		});
	};
}( jQuery ));