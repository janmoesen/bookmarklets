/**
 * Make a page more readable by disabling all page styling and applying a
 * bare minimum of our own. Go to the first thing that looks like the start
 * of the actual content so no time is wasted scrolling past initial
 * navigation etc.
 *
 * @title Readable++
 */
(function read() {
	/* The stylesheet ID/HTML data attribute prefix to use. */
	var id = 'jan-css';

	/* The more readable stylesheet. Note that the multiline string below is invalid syntax, but it works because the bookmarklet has its newlines stripped. */
	var css = '
		@namespace svg "http://www.w3.org/2000/svg";
		* {
			line-height: 1.5;
		}
		html {
			background: #fff;
			color: #000;
		}
		:link {
			color: #00e;
		}
		:visited {
			color: #528;
		}
		:link:focus, :visited:focus, :link:hover, :visited:hover {
			color: #e30;
		}
		:link:active, :visited:active {
			color: #e00;
		}
		body {
			max-width: 55em;
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
		pre {
			padding: 1ex;
			border: 1px dotted;
		}
		code, pre, .syntaxhighlighter {
			font-family: "Consolas", monospace;
			font-size: small;
			background: #ffe;
		}
		textarea {
			width: 100%;
			height: 32ex;
		}
		th, td {
			vertical-align: top;
			text-align: left;
			padding: 0.5ex;
		}
		caption {
			font-weight: bold;
			border-bottom: 1px dotted;
		}
		img:not(:hover), input[type="image"]:not(:hover), object:not(:hover), embed:not(:hover), iframe:not(:hover), canvas:not(:hover), :not(svg|*) > svg|*:not(:hover) {
			opacity: 0.25;
		}
		.cufon-canvas canvas {
			display: none;
		}
		.post_share, #janrain-social-sharebar, #sharebar {
			display: none;
			left: -1000px;
		}
		.postprofile, .signature {
			font-size: smaller;
			border-top: 1px dotted;
			opacity: 0.5;
		}
		iframe[src*="//www.facebook.com/plugins/like.php"], iframe[src*=".twitter.com/widgets/tweet_button"], iframe[src*="//www.reddit.com/static/button/"], iframe[src*="//www.stumbleupon.com/badge/embed/"] {
			width: 12em;
			height: 4ex;
			border: 1px dotted;
		}
	';

	/* Extra CSS for pages that do not appear to use tables for layout. */
	var dataTableCss = '
		tr:nth-child(odd) th:not(.' + id + '-active-col), tr:nth-child(odd) td:not(.' + id + '-active-col) {
			background: #eef;
		}
		tr:hover th, tr:hover td:not(.code), .' + id + '-active-col {
			background: #ddf;
		}
		tr th:hover, tr td:not(.code):hover {
			background: #bbf;
		}
		th code, td code {
			background: inherit;
		}
	';

	/* The attributes to disable. */
	var attrs = [
		'style',
		'background', 'bgcolor', 'color', 'text', 'link', 'vlink', 'alink', 'hlink',
		'table@width', 'tr@width', 'td@width', 'th@width', 'table@height', 'tr@height', 'td@height', 'th@height', 'colspan', 'rowspan',
		'border',
		'frameborder',
		'align',
		'face', 'font@size', 'basefont@size'
	];

	/* The selectors to try (in this order) for the first content element to scroll to. */
	var contentSelectors = [
		':not(body)#article',
		'article, :not(#spotlight) > :not(body).article, .articleContent',
		'#article_top',
		'#article_body',
		'#article_main',
		'.post-body',
		'.post, .blogpost, .blogPost',
		'[id^="post0"], [id^="post1"], [id^="post2"], [id^="post3"], [id^="post4"], [id^="post5"], [id^="post6"], [id^="post7"], [id^="post8"], [id^="post9"], [id^="post-0"], [id^="post-1"], [id^="post-2"], [id^="post-3"], [id^="post-4"], [id^="post-5"], [id^="post-6"], [id^="post-7"], [id^="post-8"], [id^="post-9"]',
		'#entry',
		'.entry',
		'#content',
		'.content',
		'[id^="content"], [class^="content"]',
		'#main',
		'.main',
		'h1',
		'#header',
		'header',
		'.header',
		'h2',
		'big'
	];

	/* URI pattern for syntax highlighting stylesheets. */
	var syntaxHighlightHrefRegex = /\b(syntax(hi(ghlight|lite))?|sh(Core|Theme[^.]*)|geshi)\./i;

	/* The main function. */
	(function execute(document) {
		var all = Array.prototype.slice.call(document.getElementsByTagName('*')),
			ourStyleSheet = document.getElementById(id),
			allStyleSheets = Array.prototype.slice.call(document.styleSheets),
			prettyPrintStyleSheet,
			matches;

		/* Special hack for The Guardian (and possibly others), which re-enables the CSS because it detects a change in font size. */
		window.TextResizeDetector && TextResizeDetector.stopDetector && TextResizeDetector.stopDetector();

		/* Add the custom stylesheet if necessary. */
		if (!ourStyleSheet) {
			(ourStyleSheet = document.createElement('style')).id = id;
			ourStyleSheet.innerHTML = css;

			/* Nested tables are considered to be used for layout. If there are none, add the CSS for more usable data tables. */
			if (!document.querySelector('table table')) {
				ourStyleSheet.innerHTML += dataTableCss;

				/* For data tables, also highlight the matching column. I do not know how to do this in pure CSS without COLGROUPs. */
				function columnMouseHandler(e) {
					if (!/^t[dh]$/i.test('' + e.target.nodeName)) {
						return;
					}

					var targetCell = e.target, nthChild = targetCell.cellIndex + 1, table = targetCell.parentNode;
					while (table && table.nodeName.toLowerCase() !== 'table') {
						table = table.parentNode;
					}

					var activeColumnClassName = id + '-active-col', activeColumnRegex = new RegExp(' ' + activeColumnClassName + ' ');
					Array.prototype.slice.call(table.querySelectorAll('th:nth-child(' + nthChild + '), td:nth-child(' + nthChild + ')')).forEach(function (cell) {
						if (e.type === 'mouseenter') {
							/* Element.classList does not work in iOS < 5 */
							cell.className = cell.className === ''
								? activeColumnClassName
								: cell.className + ' ' + activeColumnClassName;
						} else {
							cell.className = (' ' + cell.className + ' ').replace(activeColumnRegex, '');
						}
					});
				}
				document.addEventListener('mouseenter', columnMouseHandler, true);
				document.addEventListener('mouseleave', columnMouseHandler, true);
			}

			/* Adding the stylesheet node has to happen after its contents has been set, or chaos ensues. */
			document.head.appendChild(ourStyleSheet).disabled = true;

			/* (Re-)add some syntax highlighters' CSS if necessary. Those styles are often defined in the main CSS, so the HREF test in toggleStyles() does not match. */
			if (document.querySelector('.prettyprint')) {
				prettyPrintStyleSheet = document.createElement('style');
				prettyPrintStyleSheet.textContent = '@import url(http://google-code-prettify.googlecode.com/svn/trunk/src/prettify.css)';
				document.head.appendChild(prettyPrintStyleSheet);
			} else if (document.querySelector('.syntaxhighlighter')) {
				prettyPrintStyleSheet = document.createElement('style');
				/* TODO: GitHub sends this as text/plain, so it is not loaded for security reasons. Fork it on GitHub Pages, or some such. */
				prettyPrintStyleSheet.textContent = '@import url(https://raw.github.com/alexgorbatchev/SyntaxHighlighter/master/styles/shCore.css)';
				document.head.appendChild(prettyPrintStyleSheet);
			}
		}

		/* Toggle between our readable and the page's original stylesheet(s). */
		function toggleStyles() {
			ourStyleSheet.disabled = !ourStyleSheet.disabled;
			if (prettyPrintStyleSheet) {
				prettyPrintStyleSheet.disabled = ourStyleSheet.disabled;
			}
			allStyleSheets.forEach(function (styleSheet, i) {
				if (styleSheet.ownerNode !== ourStyleSheet && !syntaxHighlightHrefRegex.test(styleSheet.href)) {
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
			});

			/* Process all attributes for all elements. */
			all.forEach(function (elem, i) {
				attrs.forEach(function (attr, j) {
					/* Parse the attribute definition. Attributes can be restricted to certain elements, e.g. "table@width". */
					if (!(matches = attr.match(/([^@]+)@([^@]+)/)) || (elem.tagName && elem.tagName.toLowerCase() == matches[1])) {
						attr = matches ? matches[2] : attr;
						var names = { enabled: attr, disabled: id + '-' + attr };
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
			var disabledStyleAttr = id + '-style';
			Array.prototype.slice.call(document.querySelectorAll('.wp_syntax [' + disabledStyleAttr + ']')).forEach(function (elem) {
				elem.setAttribute('style', elem.getAttribute(disabledStyleAttr));
				elem.removeAttribute(disabledStyleAttr);
			});
		}

		/* Find the first thing that looks like the start of the actual content so we can scroll to it after applying our CSS. */
		function findContentElement() {
			if (location.hash) {
				contentSelectors.unshift('a[name="' + location.hash.substring(1) + '"]');
				contentSelectors.unshift(location.hash);
			}
			for (var i = 0; i < contentSelectors.length; i++) {
				try {
					var element = document.querySelector(contentSelectors[i]);
					/* Make sure the element was either an anchor or something "visible". */
					if (element && (element.tagName.toLowerCase() === 'a' || element.offsetWidth || element.offsetHeight)) {
						window.console && console.log('Readable++: matching selector: ' + contentSelectors[i] + '\nElement: ', element);
						return element;
					}
				}
				catch (e) {
					window.console && console.log('Readable++: bad selector: ' + contentSelectors[i] + '\nException: ' + e);
				}
			}
		}

		/* Toggle the stylesheets and scroll to the start of the content. */
		var contentElement;
		if (ourStyleSheet.disabled) {
			/* Look for the content element when our CSS is NOT active to avoid scrolling to hidden elements being unhidden by our CSS (and thus causing false positives). */
			contentElement = findContentElement();
			toggleStyles();
		} else {
			toggleStyles();
			contentElement = findContentElement();
		}
		contentElement && contentElement.scrollIntoView();

		/* Recurse for frames and iframes. */
		try {
			Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
				execute(elem.contentDocument);
			});
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}
	})(document);
})();
