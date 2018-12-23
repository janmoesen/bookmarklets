/**
 * Change the video speed (playback rate).
 *
 * @title Set video speed
 */
(function vidspeed() {
	"use strict";

	/* Recursively get all videos for the document and its sub-documents. */
	function getVideos(document) {
		let videos = Array.from(document.querySelectorAll('video'));

		/* Recurse for frames and iframes. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => videos = videos.concat(getVideos(elem.contentDocument))
			);
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}

		return videos;
	}

	let videos = getVideos(document);

	/* Make sure there are videos. */
	if (!videos.length) {
		return;
	}

	/* Try to get the parameter string from the bookmarklet/search query.
	 * If there is no parameter, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s === '') {
		s = prompt('Specify the speed (playback rate) as a number, with 1 being 100%. For example, 1.25 = 125%, 0.75 = 75%, and 1 = 100%.', videos[0].playbackRate);
	}

	if (s) {
		videos.forEach(video => video.playbackRate = s);
	}
})();
