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
		Array.from(document.querySelectorAll('[href^="//web.archive.org/web/"], [href^="http://web.archive.org/web/"], [href^="https://web.archive.org/web/"]')).forEach(
			node => node.setAttribute('href', node.getAttribute('href').replace(/^(https?:)?\/\/web\.archive\.org\/.*?(https?:\/\/)/, '$2'))
		);

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
