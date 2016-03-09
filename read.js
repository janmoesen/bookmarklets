/**
 * Make a page more readable by disabling all page styling and applying a
 * bare minimum of our own. Go to the first thing that looks like the start
 * of the actual content so no time is wasted scrolling past initial
 * navigation etc.
 *
 * @title Readable++
 */
(function read() {
	/* The style sheet for more readable content. */
	var css = (function () { /*@charset "utf-8";
		@namespace svg "http://www.w3.org/2000/svg";

		-jancss-comment { content:
			"General styles -------------------------------------------";
		}

		* {
			line-height: 1.5;
		}

		html {
			background: #fff;
			color: #222;
		}

		body {
			max-width: 52em;
			margin: 0 auto;
			padding: 1em;
			font-family: "Calibri", sans-serif;
		}

		:link {
			color: #00e;
		}

		:visited {
			color: #528;
		}

		:link:focus,
		:visited:focus,
		:link:hover,
		:visited:hover {
			color: #e30;
		}

		:link:active,
		:visited:active {
			color: #e00;
		}

		center,
		[align] {
			text-align: left;
		}

		b:not(.jancss-probably-structure),
		u,
		blink {
			font-weight: inherit;
			font-style: inherit;
			text-decoration: inherit
		}

		b.jancss-probably-structure {
			font-size: larger;
		}

		.jancss-probably-layout {
			font: inherit;
		}

		-jancss-comment { content:
			"Headers --------------------------------------------------";
		}

		h1, h2, h3 {
			font-weight: 100;
		}

		h1 {
			border-bottom: 1px solid #888;
		}

		h2 {
			border-bottom: 1px solid #bbb;
		}

		h3 {
			border-bottom: 1px dotted #bbb;
		}

		-jancss-comment { content:
			"Links in headers (probably permalinks) -------------------";
		}

		h1 a[href]:not(:hover),
		h2 a[href]:not(:hover),
		h3 a[href]:not(:hover) {
			text-decoration: none;
		}

		h1 a[href]::after,
		h2 a[href]::after,
		h3 a[href]::after {
			font-size: 75%;
			content: " #";
		}

		-jancss-comment { content:
			"Pre-formatted text and source code -----------------------";
		}

		pre {
			padding: 1ex;
			border: 1px dotted;
		}

		code,
		pre,
		.syntaxhighlighter,
		.dp-highlighter {
			font-family: "Consolas", monospace;
			font-size: small;
			background: #ffe;
		}

		.dp-highlighter + pre[name="code"] {
			display: none;
		}

		-jancss-comment { content:
			"Forms ----------------------------------------------------";
		}

		textarea {
			width: 100%;
			height: 32ex;
		}

		-jancss-comment { content:
			"Tables ---------------------------------------------------";
		}

		th,
		td {
			vertical-align: top;
			text-align: left;
			padding: 0.5ex;
		}

		.jancss-has-tables-for-layout td {
			display: inline-block;
		}

		caption {
			font-weight: bold;
			border-bottom: 1px dotted;
		}

		-jancss-comment { content:
			"Dim images and media until :hover ------------------------";
		}

		img,
		input[type="image"],
		object,
		embed,
		video,
		audio,
		iframe,
		canvas,
		:not(svg|*) > svg|* {
			max-width: 100%;
		}

		body:not(:hover) img,
		body:not(:hover) input[type="image"],
		body:not(:hover) object,
		body:not(:hover) embed,
		body:not(:hover) video,
		body:not(:hover) audio,
		body:not(:hover) iframe,
		body:not(:hover) canvas,
		body:not(:hover) :not(svg|*) > svg|* {
			opacity: 0.25;
		}

		-jancss-comment { content:
			"Limit icon dimensions --------------------------------";
		}

		svg[id*="icon"],
		svg[class*="icon"],
		[class*="icon"] svg,
		[class*="Icon"] svg,
		img[class*="icon"][src*=".svg"],
		img[class*="Icon"][src*=".svg"],
		[class*="button"] svg,
		.controls-wrapper svg,
		.svg-icon,
		.inline-icon,
		.wp-smiley,
		.smiley,
		.emoticon,
		:not(html).emoji {
			max-width: 1.4em;
			max-height: 1.4em;
		}

		-jancss-comment { content:
			"Make everything scrollable -------------------------------";
		}

		[style*="position: fixed"],
		[style*="position:fixed"] {
			position: static !important;
		}

		-jancss-comment { content:
			"Make side notes and pull quotes less conspicuous ---------";
		}

		aside:not(:hover),
		[id^="footnote_plugin_tooltip_text_"],
		blockquote[class*="quote"]:not(:hover),
		.quote-box:not(:hover),
		.pullquote:not(:hover),
		.pullQuote:not(:hover),
		.pull-quote:not(:hover) {
			opacity: 0.25;
		}

		-jancss-comment { content:
			"Decrease common forum and metadata font size -------------";
		}

		.postprofile,
		.signature {
			font-size: smaller;
			border-top: 1px dotted;
			opacity: 0.5;
		}

		-jancss-comment { content:
			"Hide common social media elements ------------------------";
		}

		iframe[src*=".facebook.com/"],
		iframe[src*=".twitter.com/widgets/"],
		iframe[src*="//plusone.google.com/_/+1/"],
		iframe[src*="//www.reddit.com/static/button/"],
		iframe[src*="//s7.addthis.com/"],
		iframe[src*="//www.stumbleupon.com/badge/embed/"],
		iframe[src*="//widgets.bufferapp.com/"] {
			width: 12em;
			height: 4ex;
			border: 1px dotted;
		}

		.twtr-widget.twtr-scroll {
			max-height: 30ex;
			overflow: auto;
		}

		:-moz-any(
			div,
			ul,
			li
		):-moz-any(
			[class*="social"],
			[class*="share"],
			[class*="sharing"]
		):-moz-any(
			[class*="post"],
			[class*="Post"],
			[class*="media"],
			[class*="Media"],
			[class*="utton"],
			[class*="idget"],
			[class*="ontainer"],
			[class*="tool"],
			[class*="Tool"],
			[class*="bar"],
			[class*="Bar"],
			[class*="meta"],
			[class*="Meta"]
		):not(
			article
		):not(
			[id*="article"]
		):not(
			[id*="Article"]
		):not(
			[class*="article"]
		):not(
			[class*="Article"]
		):not(
			[id*="main"]
		):not(
			[id*="Main"]
		) {
			display: none;
		}

		:-webkit-any(
			div,
			ul,
			li
		):-webkit-any(
			[class*="social"],
			[class*="share"],
			[class*="sharing"]
		):-webkit-any(
			[class*="post"],
			[class*="Post"],
			[class*="media"],
			[class*="Media"],
			[class*="utton"],
			[class*="idget"],
			[class*="ontainer"],
			[class*="tool"],
			[class*="Tool"],
			[class*="bar"],
			[class*="Bar"],
			[class*="meta"],
			[class*="Meta"]
		):not(
			article
		):not(
			[id*="article"]
		):not(
			[id*="Article"]
		):not(
			[class*="article"]
		):not(
			[class*="Article"]
		):not(
			[id*="main"]
		):not(
			[id*="Main"]
		) {
			display: none;
		}

		:any(
			div,
			ul,
			li
		):any(
			[class*="social"],
			[class*="share"],
			[class*="sharing"]
		):any(
			[class*="post"],
			[class*="Post"],
			[class*="media"],
			[class*="Media"],
			[class*="utton"],
			[class*="idget"],
			[class*="ontainer"],
			[class*="tool"],
			[class*="Tool"],
			[class*="bar"],
			[class*="Bar"],
			[class*="meta"],
			[class*="Meta"]
		):not(
			article
		):not(
			[id*="article"]
		):not(
			[id*="Article"]
		):not(
			[class*="article"]
		):not(
			[class*="Article"]
		):not(
			[id*="main"]
		):not(
			[id*="Main"]
		) {
			display: none;
		}

		-jancss-comment { content:
			"Hide empty list items ------------------------------------";
		}

		li:empty, li.jancss-emptyish {
			display: none;
		}

		-jancss-comment { content:
			"Make common navigation elements more compact -------------";
		}

		:-moz-any(
			nav,
			[class*="avigat"],
			[id*="avigat"],
			[class*="-nav-"],
			[class*="nav-"],
			[class$="-nav"],
			[id*="-nav-"],
			[id*="nav-"],
			[id$="-nav"],
			[role="navigation"]
		) ul {
			display: inline;
			margin: 0;
			padding: 0;
		}

		:-webkit-any(
			nav,
			[class*="avigat"],
			[id*="avigat"],
			[class*="-nav-"],
			[class*="nav-"],
			[class$="-nav"],
			[id*="-nav-"],
			[id*="nav-"],
			[id$="-nav"],
			[role="navigation"]
		) ul {
			display: inline;
			margin: 0;
			padding: 0;
		}

		:any(
			nav,
			[class*="avigat"],
			[id*="avigat"],
			[class*="-nav-"],
			[class*="nav-"],
			[class$="-nav"],
			[id*="-nav-"],
			[id*="nav-"],
			[id$="-nav"],
			[role="navigation"]
		) ul {
			display: inline;
			margin: 0;
			padding: 0;
		}

		:-moz-any(
			nav,
			[class*="avigat"],
			[id*="avigat"],
			[class*="-nav-"],
			[class*="nav-"],
			[class$="-nav"],
			[id*="-nav-"],
			[id*="nav-"],
			[id$="-nav"],
			[role="navigation"]
		) li {
			display: inline;
			margin: 0;
			padding: 0 .5em;
			border-right: 1px dotted;
		}

		:-webkit-any(
			nav,
			[class*="avigat"],
			[id*="avigat"],
			[class*="-nav-"],
			[class*="nav-"],
			[class$="-nav"],
			[id*="-nav-"],
			[id*="nav-"],
			[id$="-nav"],
			[role="navigation"]
		) li {
			display: inline;
			margin: 0;
			padding: 0 .5em;
			border-right: 1px dotted;
		}

		:any(
			nav,
			[class*="avigat"],
			[id*="avigat"],
			[class*="-nav-"],
			[class*="nav-"],
			[class$="-nav"],
			[id*="-nav-"],
			[id*="nav-"],
			[id$="-nav"],
			[role="navigation"]
		) li {
			display: inline;
			margin: 0;
			padding: 0 .5em;
			border-right: 1px dotted;
		}

		-jancss-comment { content:
			"Hide old cufón text replacement --------------------------";
		}

		.cufon-canvas canvas {
			display: none;
		}

		-jancss-comment { content:
			"Make notes on decorrespondent.nl less conspicuous --------";
		}

		.instapaper_ignore {
			opacity: 0.25;
		}

		-jancss-comment { content:
			"Hide the source text on Google Translate-d pages ---------";
		}

		.google-src-text {
			display: none;
		}

	*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '');

	/* Extra CSS for pages that do not appear to use tables for layout. */
	var dataTableCss = (function () { /*-jancss-comment {}
		tr:nth-child(odd) td:not(.jancss-active-col) {
			background: #eef;
		}

		tr:hover td:not(.code), .jancss-active-col {
			background: #ddf;
		}

		th, tr td:not(.code):hover {
			background: #bbf;
		}

		th code, td code {
			background: inherit;
		}

	*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '');

	/* The attributes to disable. */
	var attrs = [
		'style',
		'background', 'bgcolor', 'color', 'text', 'link', 'vlink', 'alink', 'hlink',
		'table@width', 'colgroup@width', 'col@width', 'tr@width', 'td@width', 'th@width', 'table@height', 'tr@height', 'td@height', 'th@height',
		'img@width', 'img@height',
		'border',
		'frameborder',
		'align',
		'face', 'font@size', 'basefont@size'
	];

	/* The selectors to try (in this order) for the first content element to scroll to. */
	var contentSelectors = [
		/* The most semantically rich elements should be used correctly so we
		 * can ass-u-me them to be the main content element, right?
		 */
		'main h1:not(:empty)',
		'main header',
		'main h2:not(:empty)',
		'main',
		'body [itemprop="blogPost"] h1:not(:empty)',
		'body [itemprop="blogPost"] header',
		'body [itemprop="blogPost"] h2:not(:empty)',
		'body [itemprop="blogPost"]',
		'body [role="main"] h1:not(:empty)',
		'body [role="main"] header',
		'body [role="main"] h2:not(:empty)',
		'body [role="main"]',
		'body [role="document"] h1:not(:empty)',
		'body [role="document"] header',
		'body [role="document"] h2:not(:empty)',
		'body [role="document"]',
		'body [role="article"] h1:not(:empty)',
		'body [role="article"] header',
		'body [role="article"] h2:not(:empty)',
		'body [role="article"]',
		'body #main h1:not(:empty)',
		'body #main header',
		'body #main h2:not(:empty)',
		'body #main',

		/* <article> is also "semantically rich", but there are several sites
		 * that have a list of related articles, each in its own <article>. A
		 * "real" article would not have any <article> siblings.
		 */
		':not(li) > article:only-of-type',

		/* Common IDs and classes for the main content element (e.g. weblog
		 * post IDs, newspaper articles, …)
		 */
		'body #article',
		'body :not(#spotlight) > .article',
		'body .articleContent',
		'body #article_top',
		'body #article_body',
		'body #article_main',
		'body .post-body:not(.field-item)',
		':not(input):not(textarea).post',
		':not(input):not(textarea).blogpost',
		':not(input):not(textarea).blogPost',
		'body [id^="post0"]',
		'body [id^="post1"]',
		'body [id^="post2"]',
		'body [id^="post3"]',
		'body [id^="post4"]',
		'body [id^="post5"]',
		'body [id^="post6"]',
		'body [id^="post7"]',
		'body [id^="post8"]',
		'body [id^="post9"]',
		'body [id^="post-0"]',
		'body [id^="post-1"]',
		'body [id^="post-2"]',
		'body [id^="post-3"]',
		'body [id^="post-4"]',
		'body [id^="post-5"]',
		'body [id^="post-6"]',
		'body [id^="post-7"]',
		'body [id^="post-8"]',
		'body [id^="post-9"]',
		'body #entry',
		'body .entry',
		'body #content',
		'body .content',
		'body [id^="content"]',
		'body [class^="content"]',
		'body #main',
		'body .main',

		/* Consider the first header (in DOM order) to be the most important
		 * one and ass-u-me it is the start of the main content.
		 */
		'h1:not(:empty)',
		'body #header',
		'header',
		'body .header',
		'h2:not(:empty)',

		/* When all else fails, just look for bigger text, which would
		 * probably be used instead of the appropriate header elements.
		 */
		'big'
	];

	/* Structure elements incorrectly used for layout purposes ("make it big and bold"). */
	var structureElementsForLayoutSelectors = [
		'//*[contains(" h1 h2 h3 h4 h5 h6 h7 ", concat(" ", local-name(), " ")) and string-length(normalize-space()) > 120]'
	];

	/* Layout elements incorrectly used for structure purposes ("bold means header"). */
	var layoutElementsForStructureSelectors = [
		/* Because there is no support for the Selectors Level 4 "subject of
		 * a selector" syntax yet (or any definite syntax, for that matter),
		 * I simply ass-u-me in the code below that the subject is a "B"
		 * element. Either the result of the selector, or the previous
		 * element sibling.
		 */
		'b:first-child + :empty',
		':empty + b + :empty',
		':empty + b:last-child',
		'div > b:only-child, p > b:only-child'
	];

	/* URI pattern for syntax highlighting style sheets. */
	var syntaxHighlightHrefRegex = /\b((syntax|pygments)(hi(ghlight(er)?|lite(r)?))?|sh(Core|Theme[^.]*)|geshi|codecolorer)[./]/i;

	/* Keep track of which elements have had their event handlers
	 * disabled/re-enabled.
	 */
	var elementsWithToggledEventHandlers = {};

	var eventHandlerAttributesToToggle = [
		'oncontextmenu',
		'onshow',

		'oninput',
		'onkeydown',
		'onkeyup',
		'onkeypress',

		'onmousedown',
		'onmouseup',
		'onmouseenter',
		'onmouseleave',
		'onmouseover',
		'onmouseout',
		'onmousemove',

		'onresize',

		'onscroll',
		'onwheel',

		'onselect',
		'onselectstart',
		'onselectionchange'
	];

	/* The main function. */
	(function execute(document) {
		function addClass(element, classNames) {
			/* HTMLElement.classList does not work on iOS 4's Safari, so this is a fallback. */
			classNames.split(/\s+/).forEach(function (className) {
				element.className = ((' ' + element.className + ' ').replace(' ' + className.trim() + ' ', '') + ' ' + className).trim();
			});
		}

		function removeClass(element, classNames) {
			classNames.split(/\s+/).forEach(function (className) {
				element.className = (' ' + element.className + ' ').replace(' ' + className.trim() + ' ', '').trim();
			});
		}

		function toArray(arrayLike) {
			return Array.prototype.slice.call(arrayLike);
		}

		var all = toArray(document.getElementsByTagName('*')),
		    ourStyleSheet = document.getElementById('jancss'),
		    allStyleSheets = toArray(document.styleSheets),
		    prettyPrintStyleSheet,
		    matches;

		/* Special hack for The Guardian (and possibly others), which re-enables the CSS because it detects a change in font size. */
		window.TextResizeDetector && TextResizeDetector.stopDetector && TextResizeDetector.stopDetector();

		/* Kill all scheduled callbacks. Naively ass-u-me that any call to
		 * setTimeout/setInterval returns the next ID from a monotonically
		 * increasing function that is used for both timeout and interval
		 * IDs. Therefore, to clear all timeouts and intervals, it suffices
		 * to get a new timeout ID and then clear everything up to that ID.
		 *
		 * Though the HTML5 specification says nothing about the return value
		 * of setTimeout/setInterval, this appears to work in Firefox 22,
		 * Chrome 27, Opera 12 and Safari 5.
		 */
		var maxTimeoutId = setTimeout(function () {
			for (var i = 1; i < maxTimeoutId; i++) {
				clearTimeout(i);
				clearInterval(i);
			}
		}, 4); /* 4 ms is the minimum timeout as per HTML5. */

		/* Now kill all the requested animation frame callbacks. Again, this
		 * naively assumes the ID will increment one by one. MDN explicitly
		 * advises against assumptions such as this one: https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame#Return_value
		 */
		var requestAnimationFrame = window.requestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function () { };

		var cancelAnimationFrame = window.cancelAnimationFrame
			|| window.mozCancelAnimationFrame
			|| window.webkitCancelAnimationFrame
			|| window.msCancelAnimationFrame
			|| function () { };

		var maxAnimationFrameRequestId = requestAnimationFrame(function () {
			for (i = 1; i < maxAnimationFrameRequestId * 2; i++) {
				cancelAnimationFrame(i);
			}

			/* Log requests to the original requestAnimationFrame. */
			window.requestAnimationFrame = function (callback) {
				if (!window.console) {
					return;
				}

				var callbackSource = callback.toSource && callback.toSource();
				if (callbackSource && callbackSource.indexOf('Readable++ requestAnimationFrame interceptor') === -1) {
					console.log('Readable++: intercepted call to requestAnimationFrame at ' + new Date());
					console.log('Readable++: callback for requestAnimationFrame: ' + callbackSource);
				}
			};
		});

		/* While in Readable++ mode, disable some elements' event handlers.
		 * This prevents hijacking events like "scroll" and "resize", which
		 * can be abused to annoy me with visual effects and whatnot, and
		 * "contextmenu" and "selectstart", which are clearly defined as
		 * universal and inalienable human rights. Look it up at your local
		 * Wikipedia office.
		 */
		[window, document, document.documentElement, document.body].forEach(function (elem) {
			/* Because the window for IFRAMEs is the same as the outer
			 * document's window, we need to keep track of wether we
			 * have toggled the event handlers. Otherwise, they might
			 * get disabled and re-enabled immediately after.
			 */
			if (elementsWithToggledEventHandlers[elem]) {
				return;
			}

			elementsWithToggledEventHandlers[elem] = true;

			/* Toggle selected event handlers that have been set using
			 * "elem.oneventx = function () { … };"
			 */
			eventHandlerAttributesToToggle.forEach(function (attrib) {
				if (elem['jancss-' + attrib]) {
					elem[attrib] = elem['jancss-' + attrib];
					delete elem['jancss-' + attrib];
				} else if (elem[attrib]) {
					elem['jancss-' + attrib] = elem[attrib];
					elem[attrib] = function () { };
				}
			});

			/* Toggle all event handlers that have been set using jQuery. */
			if (typeof jQuery === 'function') {
				/* Since jQuery 1.7. */
				if (typeof jQuery.hasData === 'function' && jQuery.hasData(elem)) {
					var data = jQuery._data(elem);
					if (data.jancssEvents) {
						data.events = data.jancssEvents;
						delete data.jancssEvents;

						jQuery._data(elem, data);

						return;
					} else if (data.events) {
						data.jancssEvents = data.events;
						delete data.events;

						jQuery._data(elem, data);

						return;
					}
				}

				/* Before jQuery 1.7. */
				var $elem = jQuery(elem);
				var eventsData = $elem.data('events');
				var jancssEventsData = $elem.data('jancssEvents');
				if (jancssEventsData) {
					$elem.data('events', jancssEventsData);
					$elem.removeData('jancssEvents');
				} else if (eventsData) {
					$elem.data('jancssEvents', eventsData);
					$elem.removeData('events');
				}
			};
		});

		/* Load bLazy.js "retina" images. This is more specific than the
		 * generic lazy-loading attributes below, and needs special handling
		 * because it specifies multiple sources in one attribute.
		 */
		toArray(document.querySelectorAll('img.b-lazy[data-src*="|"]')).forEach(function (img) {
			var attribute = 'data-src';
			var sources = img.getAttribute(attribute).split('|');
			img.src = sources.pop();
			img.removeAttribute(attribute);
		});

		/* Load Riloadr "<noscript>" images. This is more specific than the
		 * generic lazy-loading attributes below, and needs special handling
		 * because it would reset the images to blank when scrolling after
		 * Readable++ has been applied.
		 */
		toArray(document.querySelectorAll('img[data-src] + noscript')).forEach(function (noscript) {
			var img = noscript.previousElementSibling;

			var placeholder = img.previousElementSibling;
			if (placeholder && placeholder.tagName.toUpperCase() === 'SVG') {
				placeholder.parentNode.removeChild(placeholder);
			}

			img.outerHTML = noscript.textContent;

			noscript.parentNode.removeChild(noscript);
		});

		/* Load images that are supposed to be loaded lazily. */
		[
			'data-original',
			'data-lazyload',
			'data-lazy-src',
			'data-full-src',
			'data-src'
		].forEach(function (attribute) {
			toArray(document.querySelectorAll('img[' + attribute + ']')).forEach(function (img) {
				img.src = img.getAttribute(attribute);
				img.removeAttribute(attribute);
			});
		});

		/* Hide empty list items that are not ":empty" as per CSS. So,
		 * "empty" as in "containing text-less placeholders typically used
		 * for social sharing by showing an icon or logo or whatnot"
		 * (e.g. <li><a href="#"><span class="icon-fb"></span></a></li>).
		 */
		toArray(document.querySelectorAll('li :empty:not(img):not(input)')).forEach(function (elem) {
			while (elem.nodeName && elem.nodeName.toUpperCase() !== 'LI') {
				elem = elem.parentNode;
			}

			if (elem.textContent.trim() === '' && !elem.querySelector('img, input'))
			{
				addClass(elem, 'jancss-emptyish');
			}
		});

		/* Add the custom style sheet if necessary. */
		if (!ourStyleSheet) {
			(ourStyleSheet = document.createElement('style')).id = 'jancss';
			ourStyleSheet.innerHTML = css;

			/* Check if there are tables for layout. */
			var hasTablesForLayout =
				/* Are there any nested tables? */
				document.querySelector('table table') ||
				/* Check each table separately until a probably-for-layout table has been found. */
				toArray(document.querySelectorAll('table')).some(function (table) {
					/* Are we in quirks mode and does this table takes up most of the page height? */
					if (document.compatMode === 'BackCompat' && document.documentElement.scrollHeight > window.innerHeight && table.scrollHeight > 3/4 * document.documentElement.scrollHeight) {
						return true;
					}

					/* Keep track of the number of cells (columns) per row, because differing cell counts mean several td@colspan values. */
					if (table.rows.length < 3) {
						/* Do all sciencey and proclaim three rows to be the minimum sample size. */
						return false;
					}
					var numCellsPerRow = [];
					toArray(table.rows).forEach(function (row) {
						if (numCellsPerRow.indexOf(row.cells.length) === -1) {
							numCellsPerRow.push(row.cells.length);
						}
					});

					return (
						/* Are we in quirks mode and does this table have at least three rows with a different number of cells? */
						(document.compatMode === 'BackCompat' && numCellsPerRow.length >= 3) ||
						/* Does this table only have rows with just a single column? */
						(numCellsPerRow.length === 1 && numCellsPerRow[0] === 1)
					);
				});
			if (hasTablesForLayout) {
				var bodyClassName = 'jancss-has-tables-for-layout';
				addClass(document.body, bodyClassName);
			} else {
				/* If tables are likely to be used properly (i.e., for actual data), add the relevant CSS. */
				ourStyleSheet.innerHTML += dataTableCss;

				/* Highlight the matching column on :hover. I do not know how to do this in pure CSS without COLGROUPs. */
				function columnMouseHandler(e) {
					if (!/^t[dh]$/i.test('' + e.target.nodeName)) {
						return;
					}

					var targetCell = e.target, nthChild = targetCell.cellIndex + 1, table = targetCell.parentNode;
					while (table && table.nodeName.toLowerCase() !== 'table') {
						table = table.parentNode;
					}

					var activeColumnClassName = 'jancss-active-col';
					toArray(table.querySelectorAll('td:nth-child(' + nthChild + ')')).forEach(function (cell) {
						if (e.type === 'mouseenter') {
							addClass(cell, activeColumnClassName);
						} else {
							removeClass(cell, activeColumnClassName);
						}
					});
				}
				document.addEventListener('mouseenter', columnMouseHandler, true);
				document.addEventListener('mouseleave', columnMouseHandler, true);
			}

			/* Adding the style sheet node has to happen after its contents has been set, or chaos ensues. */
			document.head.appendChild(ourStyleSheet).disabled = true;

			/* (Re-)add some syntax highlighters' CSS if necessary. Those styles are often defined in the main CSS, so the HREF test in toggleStyles() does not match. */
			if (document.querySelector('.prettyprint')) {
				prettyPrintStyleSheet = document.createElement('style');
				prettyPrintStyleSheet.textContent = '@import url(https://janmoesen.github.io/bookmarklets/css/prettify.css)';
				document.head.appendChild(prettyPrintStyleSheet);
			} else if (document.querySelector('.syntaxhighlighter')) {
				prettyPrintStyleSheet = document.createElement('style');
				prettyPrintStyleSheet.textContent = '@import url(https://janmoesen.github.io/bookmarklets/css/syntaxhighlighter.css)';
				document.head.appendChild(prettyPrintStyleSheet);
			} else if (document.querySelector('.highlight .c, .highlight .k, .highlight .m, .highlight .s, .highlight .w')) {
				prettyPrintStyleSheet = document.createElement('style');
				prettyPrintStyleSheet.textContent = '@import url(https://janmoesen.github.io/bookmarklets/css/pygments.css)';
				document.head.appendChild(prettyPrintStyleSheet);
			} else if (document.querySelector('code[class*="language-"] .token.punctuation')) {
				prettyPrintStyleSheet = document.createElement('style');
				prettyPrintStyleSheet.textContent = '@import url(https://janmoesen.github.io/bookmarklets/css/prism.css)';
				document.head.appendChild(prettyPrintStyleSheet);
			}

			/* Add some classes to structure elements that have been used for layout. */
			structureElementsForLayoutSelectors.forEach(function (selector) {
				var xpathResult = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				for (var i = 0; i < xpathResult.snapshotLength; i++) {
					var elem = xpathResult.snapshotItem(i);
					addClass(elem, 'jancss-probably-layout');
				}
			});

			/* Add some classes to layout elements that have been used for structure. */
			layoutElementsForStructureSelectors.forEach(function (selector) {
				toArray(document.querySelectorAll(selector)).forEach(function (elem) {
					if (elem.tagName.toLowerCase() !== 'b') {
						elem = elem.previousElementSibling;
					}

					addClass(elem, 'jancss-probably-structure');
				});
			});
		}

		/* Toggle between our readable and the page's original style sheet(s). */
		function toggleStyles() {
			ourStyleSheet.disabled = !ourStyleSheet.disabled;
			if (prettyPrintStyleSheet) {
				prettyPrintStyleSheet.disabled = ourStyleSheet.disabled;
			}
			allStyleSheets.forEach(function (styleSheet, i) {
				if (styleSheet.ownerNode !== ourStyleSheet && !syntaxHighlightHrefRegex.test(styleSheet.href)) {
					/* Remember whether this style sheet was originally disabled or not. We can't store on the CSSStyleSheet object, so use our DOM node. */
					if (ourStyleSheet['jancss-originally-disabled-' + i] === undefined) {
						ourStyleSheet['jancss-originally-disabled-' + i] = styleSheet.disabled;
					}

					if (ourStyleSheet.disabled) {
						/* Restore this style sheet's original state. */
						styleSheet.disabled = ourStyleSheet['jancss-originally-disabled-' + i];
					} else {
						/* Disable this style sheet when ours is enabled. */
						styleSheet.disabled = true;
						try {
							/* … unless it is a pretty-print style sheet. */
							if (styleSheet.cssRules[0] && styleSheet.cssRules[0].type === styleSheet.cssRules[0].IMPORT_RULE && styleSheet.cssRules[0].href) {
								styleSheet.disabled = !styleSheet.cssRules[0].href.match(/^https:\/\/janmoesen\.github\.io\//);
							}
						} catch (e) {
						}
					}
				}
			});

			/* Process all attributes for all elements. */
			all.forEach(function (elem, i) {
				attrs.forEach(function (attr, j) {
					/* Parse the attribute definition. Attributes can be restricted to certain elements, e.g. "table@width". */
					if (!(matches = attr.match(/([^@]+)@([^@]+)/)) || (elem.tagName && elem.tagName.toLowerCase() == matches[1])) {
						attr = matches ? matches[2] : attr;
						var names = { enabled: attr, disabled: 'jancss-' + attr };
						if (elem.hasAttribute(names.enabled)) {
							elem.setAttribute(names.disabled, elem.getAttribute(names.enabled));
							elem.removeAttribute(names.enabled);
						} else if (elem.hasAttribute(names.disabled)) {
							elem.setAttribute(names.enabled, elem.getAttribute(names.disabled));
							elem.removeAttribute(names.disabled);
						}
					}
				});
			});

			/* Restore the inline styles for certain code highlighters. */
			var disabledStyleAttr = 'jancss-style';
			toArray(document.querySelectorAll('.wp_syntax [' + disabledStyleAttr + ']')).forEach(function (elem) {
				elem.setAttribute('style', elem.getAttribute(disabledStyleAttr));
				elem.removeAttribute(disabledStyleAttr);
			});
		}

		/* Find the first thing that looks like the start of the actual content so we can scroll to it after applying our CSS. */
		function findContentElement() {
			if (location.hash) {
				contentSelectors.unshift('a[name="' + location.hash.substring(1) + '"]');
				contentSelectors.unshift(location.hash.replace(/\./g, '\\.'));
			}
			for (var i = 0; i < contentSelectors.length; i++) {
				try {
					var element = document.querySelector(contentSelectors[i]);
					/* Make sure the element was either an anchor or something "visible". */
					if (element && (element.tagName.toLowerCase() === 'a' || element.offsetWidth || element.offsetHeight)) {
						window.console && console.log('Readable++: found matching selector for content element: ' + contentSelectors[i] + '\nElement: ', element);
						return element;
					}
				}
				catch (e) {
					window.console && console.log('Readable++: bad selector for content element: ' + contentSelectors[i] + '\nException: ' + e);
				}
			}
		}

		/* Check if there is an element that we should scroll into view so we can immediately start reading. */
		var contentElement, shouldScrollContentIntoView = false;
		var selection = window.getSelection && window.getSelection();
		if (selection && selection.anchorNode && (selection + '').length) {
			/* If the user has created a selection, scroll the element containing that selection into view. (I often triple-click a paragraph to select it before reading.) */
			shouldScrollContentIntoView = true;
			contentElement = selection.anchorNode;
			while (contentElement.nodeType !== contentElement.ELEMENT_NODE && contentElement.parentNode) {
				contentElement = contentElement.parentNode;
			}

			window.console && console.log('Readable++: found selected element to scroll into view: ', contentElement);
		} else if (ourStyleSheet.disabled && (contentElement = findContentElement())) {
			/* When switching from the original style sheet to ours, scroll to the start of the content, unless the user had scrolled already. */
			var tmpElement = contentElement, contentTop = 0;
			do {
				contentTop += tmpElement.offsetTop;
			} while ((tmpElement = tmpElement.offsetParent));

			shouldScrollContentIntoView = !window.scrollY || Math.abs(window.scrollY - contentTop) < 20;
		}

		/* Finally, toggle the style sheets. */
		toggleStyles();

		/* Scroll to the start of the content if we found it and have not scrolled yet. */
		shouldScrollContentIntoView && contentElement.scrollIntoView();

		/* Recurse for frames and iframes. */
		try {
			toArray(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
				execute(elem.contentDocument);
			});
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}
	})(document);
})();
