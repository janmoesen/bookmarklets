/**
 * Speed up the video and audio playback rate, starting from 10x back to 1x by
 * executing this bookmarklet multiple times. Executing it once more after the
 * normal speed will restart the cycle from the maximum speed again.
 *
 * @title FFWD ⏩
 */
(function ffwd() {
	'use strict';

	const playbackRates = [10, 4, 2, 1.5, 1];

	let playbackRateToUse = undefined;

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		Array.from(document.querySelectorAll('video, audio')).forEach(media => {
			/* Determine the playback rate to use on all video/audio, based
			 * on the first element encountered. */
			if (typeof playbackRateToUse === 'undefined') {
				for (let i = 0; i < playbackRates.length; i++) {
					if (media.playbackRate >= playbackRates[i]) {
						playbackRateToUse = i === playbackRates.length - 1
							? playbackRates[0]
							: playbackRates[i + 1];
						break;
					}
				}
			}

			media.playbackRate = playbackRateToUse;
		});

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
