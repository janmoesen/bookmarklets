/**
 * Make a page more readable by disabling all page styling and applying a
 * bare minimum of our own. Go to the first thing that looks like the start
 * of the actual content so no time is wasted scrolling past initial
 * navigation etc.
 */
(function read() {
	/* The more readable stylesheet. */
	var css = '@namespace svg "http://www.w3.org/2000/svg";
		* {
			line-height: 1.5;
		}
		body {
			max-width: 60em;
			margin: 0 auto;
			padding: 1em;
			font-family: "Calibri", sans-serif;
		}
		center, [align] {
			text-align: left;
		}
		b, i, u, s, strike, blink {
			font-weight: normal;
			font-style: normal;
			text-decoration: none
		}
		img:not(:hover), input[type="image"]:not(:hover), object:not(:hover), embed:not(:hover), iframe:not(:hover), :not(svg|*)>svg|*:not(:hover) {
			opacity: 0.25;
		}
		.post_share {
			display: none;
		}',

		/* The attributes to disable. */
		attrs = ['style', 'face', 'font@size', 'basefont@size', 'background', 'align', 'bgcolor', 'color', 'text', 'link', 'vlink', 'alink', 'hlink', 'align', 'border', 'frameborder', 'table@width', 'tr@width', 'td@width', 'th@width', 'table@height', 'tr@height', 'td@height', 'th@height', 'colspan', 'rowspan'],

		/* The selectors to try (in this order) for the first content element to scroll to. */
		contentSelectors = ['article, .article, .articleContent', '.entry, .post, .blogpost', '#content, .content, [id^="content"], [class^="content"]', '#main, .main', 'h1', 'h2', 'big'],

		/* The stylesheet ID/HTML data attribute prefix to use */
		id = 'jan-css';

	/* The main function. */
	(function execute(document) {
		var all = document.getElementsByTagName('*'),
			ourStyleSheet = document.getElementById(id),
			allStyleSheets = document.styleSheets,
			i, matches;

		/* Add the custom stylesheet if necessary. */
		if (!ourStyleSheet) {
			(ourStyleSheet = document.createElement('style')).type = 'text/css';
			ourStyleSheet.id = id;
			ourStyleSheet.innerHTML = css;
			document.head.appendChild(ourStyleSheet);
			ourStyleSheet.disabled = true;
		}

		/* Toggle between our readable and the page's original stylesheet(s). */
		ourStyleSheet.disabled = !ourStyleSheet.disabled;
		for (i = 0; i < allStyleSheets.length; i++) {
			var styleSheet = allStyleSheets[i];
			if (styleSheet.ownerNode !== ourStyleSheet)
			{
				/* Remember whether this stylesheet was originally disabled or not. We can't store on the CSSStyleSheet object, so use our DOM node. */
				if (ourStyleSheet[id + '-originally-disabled-' + i] === undefined) {
					ourStyleSheet[id + '-originally-disabled-' + i] = styleSheet.disabled;
				}

				if (ourStyleSheet.disabled) {
					/* Restore this stylesheet's original state. */
					styleSheet.disabled = ourStyleSheet[id + '-originally-disabled-' + i];
				} else {
					/* Disable this stylesheet when ours is enabled. */
					styleSheet.disabled = true;
				}
			}
		}

		/* Process all attributes for all elements. */
		for (i = 0; i < all.length; i++) {
			for (k = 0; k < attrs.length; k++) {
				/* Parse the attribute definition. Attributes can be restricted to certain elements, e.g. "table@width". */
				if (!(matches = attrs[k].match(/([^@]+)@([^@]+)/)) || (all[i].tagName && all[i].tagName.toLowerCase() == matches[1])) {
					var attr = matches ? matches[2] : attrs[k];
					var names = { enabled: attr, disabled: id + '-' + attr };
					if (all[i].hasAttribute(names.enabled)) {
						all[i].setAttribute(names.disabled, all[i].getAttribute(names.enabled));
						all[i].removeAttribute(names.enabled);
					} else if (all[i].hasAttribute(names.disabled)) {
						all[i].setAttribute(names.enabled, all[i].getAttribute(names.disabled));
						all[i].removeAttribute(names.disabled);
					}
				}
			}
		}

		/* Recurse for frames and iframes. */
		try {
			Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
				execute(elem.contentDocument);
			});
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}
	})(document);

	/* Scroll to the first thing that looks like the start of the actual content. */
	location.hash && contentSelectors.unshift(location.hash);
	for (var i = 0; i < contentSelectors.length; i++) {
		var selector = contentSelectors[i];
		try {
			var element = document.querySelector(selector);
			if (element) {
				var top = 0;
				do {
					top += element.offsetTop;
				} while ((element = element.offsetParent));
				window.scrollTo(0, top);
				break;
			}
		}
		catch (e) {
			window.console && console.log('Bad selector ', selector);
		}
	}
})();
