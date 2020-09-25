/**
 * Remove analytics and tracking parameters such as Google Analytics’ “utm_*”
 * and Facebook’s “fbclid” from the current document location (URI/URL) and
 * from the links on the page. It does not reload the page or its frames.
 *
 * @title rm “UTM” etc.
 */
(function rmutm() {
	'use strict';

	/* The following list was based on https://en.wikipedia.org/wiki/UTM_parameters#See_also and has since been expanded. */
	const hrefRegexp = /[?&](utm_|fbclid|gclid|gclsrc|dclid|mscklid|zanpid|ss_)/;
	const parameterRegexp = /^(utm_|fbclid|gclid|gclsrc|dclid|mscklid|zanpid|ss_(source|email|campaign))/;

	function clearQueryString(queryString) {
		return new URLSearchParams(
			Array.from(new URLSearchParams(queryString))
				.filter(([key, value]) => !key.match(parameterRegexp))
		).toString();
	}

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/* Update the document location. */
		const oldUrl = new URL(document.location);

		const newUrl = new URL(document.location);
		newUrl.search = clearQueryString(oldUrl.search);

		if (oldUrl.toString() !== newUrl.toString()) {
			document.defaultView.history.replaceState({}, document.title, newUrl);
		}

		/* Update all A@href links in the document. */
		Array.from(document.querySelectorAll('a[href]'))
			.filter(a => a.href.match(hrefRegexp))
			.forEach(a => {
				const oldUrl = new URL(a.href);

				const newUrl = new URL(a.href);
				newUrl.search = clearQueryString(oldUrl.search);

				if (oldUrl.toString() !== newUrl.toString()) {
					a.href = newUrl.toString();
				}
			});

		/* Recurse for frames and IFRAMEs. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => execute(elem.contentDocument)
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
