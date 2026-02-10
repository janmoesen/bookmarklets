/**
 * Toggle between instances of Invidious and YouTube itself.
 *
 * Invidious is an open-source minimal YouTube front-end. It often gets blocked
 * by YouTube, so try different instances before going to the original and
 * heavily enshittified YouTube.
 *
 * @title YouTube 🔀 Invidious
 */
(function yt2inv() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		const knownDomains = [
			'inv.nadeko.net',
			'yewtu.be',
			'invidious.nerdvpn.de',
			'www.youtube.com',
		];

		const url = new URL(location);
		for (let i = 0; i < knownDomains.length; i++) {
			if (url.host === knownDomains[i]) {
				const newI = i === knownDomains.length - 1
					? 0
					: i + 1;

				url.host = knownDomains[newI];
				location = url;
				return;
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
