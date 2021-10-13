/**
 * Rewrite links to the Internet Archive Wayback Machine’s saved pages back to
 * the original URIs.
 *
 * @title Unarchive Wayback Machine links
 */
(function unarchive() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		const isOnArchiveDotOrg = document.location.host === 'web.archive.org';
		let wbASelectors;

		if (isOnArchiveDotOrg) {
			wbASelectors = [
				/* The Wayback Machine does not rewrite *all* HREF attributes
				 * in the HTML source. Relative HREFs are left alone, e.g. on
				 * <https://web.archive.org/web/20210118051332/http://www.w3.org/2006/11/mwbp-tests/index.xhtml>:
				 *
				 * `<a href="https://web.archive.org/web/20210118051332/http://www.w3.org/2005/MWI/BPWG/techs/EncodingDeclarationSupport">`
				 *
				 * vs.
				 *
				 * `<a href="test-text-html.html">`
				 *
				 * So we have to check the HREF for *every* A element to get its
				 * resolved URI.
				 */
				'a[href]'
			];
		} else {
			wbASelectors = [
				'a[href^="//web.archive.org/web/"]',
				'a[href^="http://web.archive.org/web/"]',
				'a[href^="https://web.archive.org/web/"]'
			];
		}

		/* Wombat (the Wayback Machine’s JS library) dynamically rewrites URIs by
		 * intercepting calls to `{get,set}Attribute('href')` and the `a.href` getter
		 * and setter. However, calls to `setAttributeNS` are *not* intercepted. Take
		 * advantage of the `a.href` interceptor that returns the resolved original URI
		 * and use `setAttributeNS` to override the Wayback Machine’s rewritten HREF.
		 *
		 * On pages outside of web.archive.org, `a.href` returns the full archive.org
		 * URI, so we have to strip it ourselves.
		 */
		Array.from(document.querySelectorAll(wbASelectors.join(', '))).forEach(a => {
			let originalUri = a.href;

			if (!isOnArchiveDotOrg) {
				originalUri = originalUri.replace(/^https?\:\/\/web.archive\.org\/web\/([^\/]+\/)?(https?:\/\/.*)/, '$2');
			}

			a.setAttributeNS('', 'href', originalUri);
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
