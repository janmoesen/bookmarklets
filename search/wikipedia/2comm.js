/**
 * Go to the corresponding Wikimedia Commons page for a Wikipedia article.
 *
 * @title Go to Wikimedia Commons
 * @keyword 2comm
 */
(function() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		const commonsLink = document.querySelector('.wb-otherproject-link.wb-otherproject-commons a[href], .sistersitebox a[href^="https://commons.wikimedia.org/wiki/"], .sistersitebox a[href^="https://commons.m.wikimedia.org/wiki/"]');
		if (commonsLink) {
			try {
				top.location = commonsLink.href;
				return;
			} catch (e) {
				location = commonsLink.href;
			}
		}

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
