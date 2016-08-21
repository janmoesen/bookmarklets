/**
 * Load the full-size versions of resized images based on their "src"
 * attribute, or their containing link's "href" attribute. Also, make IFRAMEs
 * take up the entire width of their offset parent (useful for embedded videos
 * and whatnot).
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
				 * anything) from the URL. */
				.replace(/\?(#.*)?$/, '$1')

				/* Remove empty fragment identifiers from the URL. */
				.replace(/#$/, '')
			;

			changeSrc(img, newSrc, 'found image with parameter "' + parameterName + '" in query string');
		});
	});

	/* Show the original image for Polopoly CMS "generated derivatives".
	 * Example:
	 * http://sporza.be/polopoly_fs/1.2671026!image/1706320883.jpg_gen/derivatives/landscape670/1706320883.jpg
	 * http://sporza.be/polopoly_fs/1.2671026!image/1706320883.jpg
	 */
	[].forEach.call(
		document.querySelectorAll('img[src*="_gen/derivatives/"]'),
		function (img) {
			var matches = img.src.match(/(.*([^/]+\.(jpe?g|png|gif)))_gen.*\2/);
			if (matches && matches[1]) {
				changeSrc(img, matches[1], 'found image with Polopoly CMS "generated derivative" URL');
			}
		}
	);

	/* Try to load the originals for images whose source URLs look like
	 * thumbnail/resized versions.
	 * Example:
	 * http://www.cycling-challenge.com/wp-content/uploads/2014/08/IMG_6197-150x150.jpg
	 * http://www.cycling-challenge.com/wp-content/uploads/2014/08/IMG_6197.jpg
	 */
	[].forEach.call(
		document.images,
		function (img) {
			var oldSrc = img.src;
			var matches = oldSrc.match(/(.*)[-_.@]\d+x\d+(\.[^\/.]+)/);
			if (matches && matches[1] && matches[2]) {
				var newSrc = matches[1] + matches[2];

				changeSrc(img, newSrc, 'found image whose URL looks like a thumbnail/resized version');
			}
		}
	);

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
				changeSrc(img, a.href, 'found linked image with ' + Math.round(similarity * 100) + '% similarity');
			}

		}
	);

	/* Make video IFRAMEs take up the entire width of their offset parent. */
	var iframesToEnlargeSelectors = [
		'iframe[src*="//www.youtube.com/embed/"]',
		'iframe[src*="//player.vimeo.com/video/"]'
	];

	[].forEach.call(
		document.querySelectorAll(iframesToEnlargeSelectors.join(', ')),
		function (iframe) {
			var scale = iframe.offsetParent.offsetWidth / iframe.offsetWidth;
			iframe.style.width = (iframe.offsetWidth * scale) + 'px';
			iframe.style.height = (iframe.offsetHeight * scale) + 'px';
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

	/**
	 * Change the IMG@src and fall back to the original source if the new
	 * source triggers an error.
	 */
	function changeSrc(img, newSrc, reason)
	{
		if (img.src === newSrc) {
			return;
		}

		if (window.console && console.log) {
			console.log('Load full images: ' + reason + ': ', img);
			console.log('→ Old img.src: ' + img.src);
			console.log('→ New img.src: ' + newSrc);
		}

		if (!img.hasAttribute('data-original-src')) {
			img.setAttribute('data-original-src', img.src);
		}

		if (img.hasAttribute('srcset')) {
			img.setAttribute('data-original-srcset', img.getAttribute('srcset'));
			img.removeAttribute('srcset');
		}

		img.addEventListener('error', function restoreOriginalSrc() {
			if (window.console && console.log) {
				console.log('Load full images: error while loading new source for image: ', img);
				console.log('→ Unable to load new img.src:    ' + newSrc);
				console.log('→ Resetting to original img.src: ' + img.getAttribute('data-original-src'));
			}

			img.removeEventListener('error', restoreOriginalSrc);

			img.src = img.getAttribute('data-original-src');

			if (img.hasAttribute('data-original-srcset')) {
				img.setAttribute('srcset', img.getAttribute('data-original-srcset'));
				img.removeAttribute('data-original-srcset');
			}
		});

		img.src = newSrc;
	}
})();
