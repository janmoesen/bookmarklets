/**
 * Load the full-size versions of resized images based on their "src"
 * attribute, or their containing link's "href" attribute.
 *
 * @title Load full images
 * @keyword full-img
 */
(function loadFullSizeImages() {
	/* Get rid of "width=", "height=" etc. in IMG@src query strings. */
	var selectors = [
		'img[src*="?"][src*="maxWidth="][src*="maxHeight="]',
		'img[src*="?"][src*="maxwidth="][src*="maxheight="]',
		'img[src*="?"][src*="width="][src*="height="]',
		'img[src*="?"][src*="w="][src*="h="]'
	];

	[].forEach.call(
		document.querySelectorAll(selectors.join(', ')),
		function (img) {
			var queryParts = img.src.replace(/.*\?/, '').split('&');

			var newParts = queryParts.filter(function (s) {
				return s.length && !s.match(/^(w|width|maxwidth|maxWidth|h|height|maxheight|maxHeight)=/);
			});

			var newSrc = img.src.replace(/\?.*/, '');

			if (newParts.length) {
				newSrc += '?' + newParts.join('&');
			}

			if (img.src === newSrc) {
				return;
			}

			if (window.console && console.log) {
				console.log('Load full images: found matching query string; old img.src: ', img.src);
				console.log('Load full images: found matching query string; new img.src: ', newSrc);
			}

			img.src = newSrc;
	});

	/* Change the IMG@src of linked images to their link's A@href if they look
	 * similar, assuming that the linked version is larger. */
	[].forEach.call(
		document.querySelectorAll('a img'),
		function (img) {
			var a = img.parentNode;
			while (a && a.tagName && a.tagName.toLowerCase() !== 'a') {
				a = a.parentNode;
			}

			if (!a) {
				return;
			}

			if (a.href === img.src) {
				return;
			}

			var similarity = getSimilarity('' + img.src, '' + a.href);

			if (similarity > 0.66) {
				if (window.console && console.log) {
					console.log('Load full images: found linked image with ', Math.round(similarity * 100), '% similarity; old img.src: ', img.src);
					console.log('Load full images: found linked image with ', Math.round(similarity * 100), '% similarity; new img.src: ', a.href);
				}

				img.src = a.href;
			}

		}
	);

	/**
	 * Crudely calculate the similarity between two strings. Taken from
	 * http://stackoverflow.com/a/10473855. An alternative would be the
	 * Levenshtein distance, implemented in JavaScript here:
	 * http://andrew.hedges.name/experiments/levenshtein/
	 */
	function getSimilarity(strA, strB) {
		var result = 0, i = Math.min(strA.length, strB.length);
		while (--i) {
			if (strA[i] === strB[i])
			{
				continue;
			}

			if (strA[i].toLowerCase() === strB[i].toLowerCase())
			{
				result++;
			}
			else
			{
				result += 4;
			}
		}

		return 1 - (result + 4 * Math.abs(strA.length - strB.length)) / (2 * (strA.length + strB.length));
	}
})();
