/**
 * Get rid of full-page overlays.
 *
 * @title rm overlays
 */
(function rmo() {
	"use strict";

	function getFirstZIndexedElement(elements) {
		if (!Array.isArray(elements)) {
			elements = Array.from(elements);
		}

		for (let i = 0; i < elements.length; i++) {
			if (!isNaN(getComputedStyle(elements[i]).zIndex)) {
				return elements[i];
			}
		}

		return null;
	}

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/* Look for absolutely positioned (well, Z-indexed) elements that
		* cover the entire width of the page. Look for them in the vertical
		* center, to avoid cookie/GDPR/… banners that are typically at the
		* top or bottom of the window, and slightly away from the edges, to
		* avoid scrollbars/social sharing toolbars/… */
		let leftX = 64;
		let leftY = document.defaultView.innerHeight / 2;
		let leftOverlay = getFirstZIndexedElement(document.elementsFromPoint(leftX, leftY));
		if (!leftOverlay) {
			console.log('rmo: did not find Z-indexed overlay at (' + leftX + ', ' + leftY + ')');
			return;
		}

		let rightX = document.defaultView.innerWidth - 64;
		let rightY = document.defaultView.innerHeight / 2;
		let rightOverlay = getFirstZIndexedElement(document.elementsFromPoint(rightX, rightY));
		if (!rightOverlay) {
			console.log('rmo: did not find Z-indexed overlay at (' + rightX + ', ' + rightY + ')');
			return;
		}

		if (leftOverlay !== rightOverlay) {
			console.log('rmo: did not detect full-width overlay; left:', leftOverlay, '; right:', rightOverlay);
			return;
		}

		let centerX = document.defaultView.innerWidth / 2;
		let centerY = document.defaultView.innerHeight / 2;
		let centerElements = document.elementsFromPoint(centerX, centerY);
		if (!centerElements.indexOf(leftOverlay) === -1) {
			console.log('rmo: overlay candidate (', leftOverlay, ') not found at (' + centerX + ', ' + centerY + ')');
			return;
		}

		/* Include the transparent timeline overlay on Twitter.com */
		if (document.location.host.match(/^(.+\.)?twitter\.com$/)) {
			document.querySelectorAll('div[role="group"]').forEach(div => {
				if (div.offsetWidth / window.innerWidth >= 0.75 && div.offsetHeight / window.innerHeight * 100 >= 0.75) {
					centerElements.unshift(div);
				}
			});
		}

		/* Hide the overlay and its “visual descendants” (i.e., the elements
		 * on top of the overlay). */
		for (let i = 0; i < centerElements.length; i++) {
			console.log('rmo: hiding', centerElements[i]);

			centerElements[i].style.display = 'none';

			if (centerElements[i] === leftOverlay) {
				break;
			}
		}

		/* Re-enable scrolling on the BODY element. */
		let currentBodyStyle = document.body.hasAttribute('style')
			? document.body.getAttribute('style')
			: '';

		let newBodyStyle = currentBodyStyle +
			'; overflow: auto !important' +
			'; position: static !important';

		document.body.setAttribute('style', newBodyStyle);

		/* Re-enable scrolling on Quora.com. */
		document.body.classList.remove('login_no_scroll');

		/* Re-enable scrolling disabled by inline styles. */
		[].forEach.call(
			document.querySelectorAll('[style*="overflow"][style*="hidden"]'),
			function (elem) {
				elem.setAttribute('style', elem.getAttribute('style').replace(/overflow\s*:\s*hidden\s*;?/, ''));
			}
		);

		/* Re-enable pointer-events disabled by inline styles. */
		[].forEach.call(
			document.querySelectorAll('[style*="pointer-events"][style*="none"]'),
			function (elem) {
				elem.setAttribute('style', elem.getAttribute('style').replace(/pointer-events\s*:\s*none\s*;?/, ''));
			}
		);

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
