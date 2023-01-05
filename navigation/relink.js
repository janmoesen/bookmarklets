/**
 * Replace all external links with new “A” elements with the same @href,
 * @class and inner HTML content, but without any previously attached event
 * handlers.
 *
 * Mainly useful for Google search result pages when trying to copy links
 * directly off those pages, so Google does not obfuscate them with tracker
 * garbage (which happens on click, before the link URL has been copied).
 *
 * @title Re-link
 */
(function relink() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		let thisDomain = location.protocol + '//' + location.hostname + '/';
		Array.from(document.querySelectorAll('a[href]:not([href^="/"]):not([href^="' + thisDomain + '"])')).forEach(a => {
			let newA = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
			newA.href = a.href;
			newA.setAttribute('class', a.getAttribute('class'));
			newA.innerHTML = a.innerHTML;
			a.replaceWith(newA);
			console.log('relink: Replaced', a, 'with', newA);
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
