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
