/**
 * Remove analytics and tracking parameters such as Google Analytics’ “utm_*”
 * and Facebook’s “fbclid” from the current document location (URI/URL) and
 * from the links on the page. It does not reload the page or its frames.
 *
 * @title Untrack links.
 */
(function untrack() {
	'use strict';

	/* The following list was based on
	* <https://en.wikipedia.org/wiki/UTM_parameters#See_also> and has since been
	* expanded, primarily with the code from https://privacytests.org/
	* <https://github.com/arthuredelstein/privacytests.org/blob/master/testing/index.js>.
	* */
	const parameterPatterns =[
		/* Google (Analytics, Ads, DoubleClick) */
		'utm_[^=]*',
		'gclid',
		'dclid',

		 /* Facebook */
		'fbclid',
		'__cft__((%5B|\\[)[^=]*)?',
		'__tn__',
		'__eep__',

		 /* Instagram */
		'igshid',

		/* Microsoft/Bing */
		'msclkid',

		 /* Mailchimp */
		'mc_eid',

		 /* HubSpot */
		'__hsfp',
		'__hssc',
		'__hstc',
		'_hsenc',
		'hsCtaTracking',

		 /* Drip.com */
		'__s',

		/* Adobe Marketo */
		'mkt_tok',

		/* MailerLite */
		'ml_subscriber',
		'ml_subscriber_hash',

		/* Omeda */
		'oly_anon_id',
		'oly_enc_id',

		/* Unknown Russian tracker */
		'rb_clickid',

		/* Adobe Site Catalyst */
		's_cid',
		'ss_[^=]*',

		/* Vero */
		'vero_conv',
		'vero_id',

		/* Wicked Reports */
		'wickedid',

		/* Yandex */
		'yclid',
		'ymclid',
		'_openstat',

		/* Zanox/Awin */
		'zanpid'
	];

	const hrefRegexp = new RegExp('[?&](' + parameterPatterns.join('|') + ')=');
	const parameterRegexp = new RegExp('^(' + parameterPatterns.join('|') + ')$');

	/**
	 * Return the given query string without the known tracking parameters.
	 */
	function cleanQueryString(queryString) {
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
		newUrl.search = cleanQueryString(oldUrl.search);

		if (oldUrl.toString() !== newUrl.toString()) {
			document.defaultView.history.replaceState({}, document.title, newUrl);
		}

		/* Update all A@href links in the document. */
		Array.from(document.querySelectorAll('a[href]'))
			.filter(a => a.href.match(hrefRegexp))
			.forEach(a => {
				try {
					const oldUrl = new URL(a.href);

					const newUrl = new URL(a.href);
					newUrl.search = clearQueryString(oldUrl.search);

					if (oldUrl.toString() !== newUrl.toString()) {
						a.href = newUrl.toString();
					}
				} catch (e) {
				}
			});

		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
