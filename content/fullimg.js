/**
 * Load the full-size versions of resized images based on their "src"
 * attribute, or their containing link's "href" attribute.
 *
 * @title Load full images
 * @keyword fullimg
 */
(function loadFullSizeImages() {
	/* Get rid of "width=", "height=" etc. followed by numbers or number pairs
	 * in IMG@src query strings. */
	var parameterNames = [
		'width',
		'Width',

		'height',
		'Height',

		'maxwidth',
		'maxWidth',
		'MaxWidth',

		'maxheight',
		'maxHeight',
		'MaxHeight',

		'w',
		'W',

		'h',
		'H',

		'fit',
		'Fit',

		'resize',
		'reSize',
		'Resize',

		'size',
		'Size'
	];

	parameterNames.forEach(function (parameterName) {
		var selector = 'img[src*="?' + parameterName + '="]'
			+ ', img[src*="?"][src*="&' + parameterName + '="]';

		/* Match query string parameters (?[…&]name=value[&…]) where the value is
		 * a number (e.g. "width=1200") or a pair of numbers (e.g. * "resize=640x480"). */
		var parameterReplacementRegexp = new RegExp('(\\?[^#]*&)?' + parameterName + '=[1-9][0-9]+(?:(?:[xX,*]|%2[CcAa])[1-9][0-9]+)?([^&#]*)');

		[].forEach.call(document.querySelectorAll(selector), function (img) {
			var newSrc = img.src
				 /* Remove the parameter "name=value" pair from the query string. */
				.replace(parameterReplacementRegexp, '$1$2')

				/* Remove trailing "&" from the query string. */
				.replace(/(\?[^#]*)&(#.*)?$/, '$1$2')

				/* Remove empty query strings ("?" not followed by
				 * anything) from the query string. */
				.replace(/\?(#.*)?$/, '$1')

				/* Remove empty fragment identifiers from the URL. */
				.replace(/#$/, '')
			;

			if (img.src === newSrc) {
				return;
			}

			if (window.console && console.log) {
				console.log('Load full images: found image with matching query string:', img)
				console.log('→ Old img.src: ' + img.src);
				console.log('→ New img.src: ' + newSrc);
			}

			img.src = newSrc;
		});
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
					console.log('Load full images: found linked image with ' + Math.round(similarity * 100) + '% similarity:', img);
					console.log('→ Old img.src: ' + img.src);
					console.log('→ New img.src: ' + a.href);
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
