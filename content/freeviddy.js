/**
 * Free the VIDEO elements: get rid of overlays, and enable the native controls.
 *
 * Useful on https://www.instagram.com/ where the stupid overlays prevent
 * showing the controls and triggering the context menu, so you don’t know how
 * long the video will take and can't play the video in full screen mode.
 *
 * @title Free Viddy
 */
(function freeviddy() {
	"use strict";

	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	let console = (function () {
		let iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElementNS('http://www.w3.org/1999/xhtml', 'iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			(document.body || document.documentElement).appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () {}
		};
	})();

	/* Recursively execute the main logic on the document and its sub-documents. */
	function execute(document) {
		document.addEventListener('mousemove', function debouncer(event) {
			clearTimeout(debouncer.timeoutId);
			debouncer.timeoutId = setTimeout(function () {
				let elementsUnderPointer = document.elementsFromPoint(event.clientX, event.clientY);
				let overlaysToRemove = [];

				for (let i = 0; i < elementsUnderPointer.length; i++) {
					if (elementsUnderPointer[i].tagName.toUpperCase() === 'VIDEO' && !elementsUnderPointer[i].xxxJanFreeViddyProcessed) {
						let video = elementsUnderPointer[i];
						video.controls = true;
						video.xxxJanFreeViddyProcessed = true;

						if (i === 0) {
							console.log('Free Viddy: found video without overlays:', video);
						} else {
							overlaysToRemove = elementsUnderPointer.slice(0, i);
							console.log(`Free Viddy: found video with ${i} overlays:`, video);
						}

						break;
					}
				}

				if (overlaysToRemove.length) {
					overlaysToRemove.forEach(element => element.remove());
				}
			}, 50);
		});

		/* Recurse for frames and iframes. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => execute(elem.contentDocument)
			);
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}
	}

	execute(document);
})();
