/**
 * Remove analytics and tracking parameters such as Google Analytics’ “utm_*”
 * and Facebook’s “fbclid” from the current document location (URI/URL) and
 * from the links on the page. It does not reload the page or its frames.
 *
 * @title Untrack links
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

		/* Omnisend */
		'omnisendContactID',

		/* Cloudflare DDOS challenge tokens */
		'__cf_chl_jschl_tk__',
		'__cf_chl_captcha_tk__',

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

	/* Link redirectors in the form 'CSS selector': handlerFunction(element). */
	const linkRedirectors = {
		/* Facebook */
		'a[href^="https://l.facebook.com/l.php?"]': a => {
			/* Facebook’s `l.php` takes the original URI in the `u` query string parameter. We do not care about the checksum or other parameters. */
			a.href = new URLSearchParams(new URL(a.href).search)?.get('u') ?? a.href;
		},

		/* Google */
		'a[href^="https://www.google."][href*="/url?"], a[href^="http://www.google."][href*="/url?"], a[href^="/url?"]': a => {
			/* Make sure we only process Google’s redirects. It seems the
			 * localised sites (e.g. www.google.de) do not use the `/url?`
			 * redirect, so checking if `a.hostname === 'www.google.com'`
			 * should suffise. However, the following regexp check is a good
			 * compromise between allowing only the `.com` and incorporating
			 * the entire Public Suffix List to check for valid top-level
			 * Google domains. */
			if (a.getAttribute('href').indexOf('/url?') === 0 && !a.hostname.match(/^www\.google\.(com?\.)?[^.]+$/)) {
				return;
			}

			const usp = new URLSearchParams(new URL(a.href).search);
			/* Sometimes the parameters is `url`, other times `q`. Heh. */
			a.href = usp.get('url') ?? usp.get('q') ?? a.href;
		}
	};

	/**
	 * Return the given query string without the known tracking parameters.
	 */
	function cleanQueryString(queryString) {
		return new URLSearchParams(
			Array.from(new URLSearchParams(queryString))
				.filter(([key, value]) => !key.match(parameterRegexp))
		).toString();
	}

	/**
	 * Clean the query string for the given element’s HREF attribute.
	 */
	function cleanQueryStringForHrefAttribute(element) {
		try {
			const oldUrl = new URL(element.href);

			const newUrl = new URL(element.href);
			newUrl.search = cleanQueryString(oldUrl.search);

			if (oldUrl.toString() !== newUrl.toString()) {
				element.href = newUrl.toString();
			}
		} catch (e) {
		}
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

		/* Circumvent link redirectors. */
		Object.entries(linkRedirectors).forEach(
			([selector, callback]) => document.querySelectorAll(selector).forEach(element => callback(element))
		);

		/* Update all A@href links in the document. */
		Array.from(document.querySelectorAll('a[href]'))
			.filter(a => a.href.match(hrefRegexp))
			.forEach(a => cleanQueryStringForHrefAttribute(a));

		/* Prevent tracking attributes from being re-added (looking at you, Facebook!) */
		new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				cleanQueryStringForHrefAttribute(mutation.target);

				Object.entries(linkRedirectors).forEach(
					([selector, callback]) => {
						mutation.target.matches(selector) && callback(mutation.target)
					}
				);
			});
		}).observe(document, {
			attributes: true,
			attributeFilter: ['href'],
			subtree: true
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
