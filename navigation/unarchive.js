/**
 * Rewrite links to the Internet Archive Wayback Machine’s saved pages back to
 * the original URLs.
 *
 * @title Unarchive Wayback Machine links
 */
(function unarchive() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/* Bypass the attribute setter from Wombat (the Wayback Machine’s JS library) that dynamically rewrites URLs. */
		const setAttrMethod = document.defaultView.Element.prototype._orig_setAttribute
			? document.defaultView.Element.prototype._orig_setAttribute
			: document.defaultView.Element.prototype.setAttribute;

		Array.from(document.querySelectorAll('a[href^="//web.archive.org/web/"], a[href^="http://web.archive.org/web/"], a[href^="https://web.archive.org/web/"]')).forEach(
			a => setAttrMethod.call(a, 'href', a.getAttribute('href').replace(/^(https?:)?\/\/web\.archive\.org\/.*?(https?:\/\/)/, '$2'))
		);

		if (document.location.host === 'web.archive.org') {
			Array.from(document.querySelectorAll('a[href^="/web/"][href*="://"]')).forEach(
				a => a.setAttribute('href', a.getAttribute('href').replace(/^\/web\/.*?(https?:\/\/)/, '$1'))
			);
		}

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
