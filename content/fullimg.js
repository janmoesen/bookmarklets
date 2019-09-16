/**
 * Load the full-size versions of resized images based on their "src"
 * attribute, or their containing link's "href" attribute. Also, make IFRAMEs
 * take up the entire width of their offset parent (useful for embedded videos
 * and whatnot). Same goes for the VIDEO elements.
 *
 * @title Load full images
 */
(function fullimg() {
	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	var console = (function () {
		var iframe = document.getElementById('xxxJanConsole');
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
		var parameterReplacementRegexp = new RegExp('(\\?[^#]*&)?' + parameterName + '=[1-9][0-9]+(?:(?:[xX,*:]|%2[CcAa]|%3[Aa])[1-9][0-9]+)?([^&#]*)');

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
	 *
	 * Example:
	 * https://sporza.be/polopoly_fs/1.2671026!image/1706320883.jpg_gen/derivatives/landscape670/1706320883.jpg
	 * https://sporza.be/polopoly_fs/1.2671026!image/1706320883.jpg
	 */
	[].forEach.call(
		document.querySelectorAll('img[src*="_gen/derivatives/"]'),
		function (img) {
			var matches = img.src.match(/(.*\.(jpe?g|png|gif))_gen.*\.\2(\?.*)?$/);
			if (matches && matches[1]) {
				changeSrc(img, matches[1], 'found image with Polopoly CMS "generated derivative" URL');
			}
		}
	);

	/* Try to load the originals for images whose source URLs look like
	 * thumbnail/resized versions with dimensions.
	 */
	[].forEach.call(
		document.images,
		function (img) {
			var oldSrc = img.src;
			/* Example:
			 * https://www.cycling-challenge.com/wp-content/uploads/2014/08/IMG_6197-150x150.jpg
			 * https://www.cycling-challenge.com/wp-content/uploads/2014/08/IMG_6197.jpg
			 */
			var matches = oldSrc.match(/(.*)[-_.@]\d+x\d+(\.[^\/.]+)/);
			if (matches && matches[1] && matches[2]) {
				var newSrc = matches[1] + matches[2];

				return changeSrc(img, newSrc, 'found image whose URL looks like a thumbnail/resized version');
			}

			/* Example:
			 * https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kowloon-Walled-City-1898.jpg/220px-Kowloon-Walled-City-1898.jpg
			 * https://upload.wikimedia.org/wikipedia/commons/8/83/Kowloon-Walled-City-1898.jpg
			 */
			matches = oldSrc.match(/(.*\/)thumb\/(.*)\/[^\/]+$/);
			if (matches) {
				var newSrc = matches[1] + matches[2];

				return changeSrc(img, newSrc, 'found image whose URL looks like a MediaWiki thumbnail/resized version');
			}

		}
	);

	/* Try to load the originals for images whose source URLs look like
	 * thumbnail/resized versions with a text label.
	 *
	 * Example:
	 * https://www.crazyguyonabike.com/pics/docs/00/01/27/84/small/DSCF3555.JPG
	 * https://www.crazyguyonabike.com/pics/docs/00/01/27/84/large/DSCF3555.JPG
	 */
	var thumbnailPathRegexp = /(.*[/.-])(small|thumb|thumbnail|resized|preview|medium)([/.-].*)/;

	var fullSizePathParts = [
		'large',
		'original',
		'source',
		'normal',
		'xlarge',
	];

	[].forEach.call(
		document.images,
		function (img) {
			var oldSrc = img.src;
			var matches = oldSrc.match(thumbnailPathRegexp);
			if (matches) {
				var newSources = [];

				fullSizePathParts.forEach(function (part) {
					newSources.push(matches[1] + part + matches[3]);
				});

				changeSrc(img, newSources, 'found image whose URL looks like a thumbnail/resized version');
			}
		}
	);

	/* Change the IMG@src of linked images to their link's A@href if they look
	 * similar, assuming that the linked version is larger. */
	[].forEach.call(
		document.querySelectorAll('a img'),
		function (img) {
			if (!img.src) {
				return;
			}

			var a = img.parentNode;
			while (a && a.tagName && a.tagName.toLowerCase() !== 'a') {
				a = a.parentNode;
			}

			if (!a) {
				return;
			}

			var aHref = a.href;

			if (a.hostname.match(/\.blogspot\.com$/)) {
				/* Get rid of Blogspot's links to useless HTML wrappers. */
				aHref = aHref.replace(/\/(s\d+)-h\/([^\/]+)$/, '/$1/$2');
			}

			if (aHref === img.src) {
				return;
			}

			/* Simplify a URL for similarity calculation. */
			function simplifyUrl(url) {
				return ('' + url)
					.replace(/\d+/g, '0')
					.replace(/^https?:/, '');
			}

			var similarity = getSimilarity(simplifyUrl(img.src), simplifyUrl(a.href));

			if (similarity > 0.66) {
				changeSrc(img, aHref, 'found linked image with ' + Math.round(similarity * 100) + '% similarity');
			}
		}
	);

	/* Change all Blogspot images that have not been changed yet. */
	Array.from(
		document.querySelectorAll('img[src*="bp.blogspot.com/"]')
	).forEach(img => {
		let matches;
		if ((matches = img.src.match(/^(.*\/)s(\d+)(\/[^/]+)$/)) && matches[2] < 9999) {
			let newSrc = matches[1] + 's9999' + matches[3];
			changeSrc(img, newSrc, 'found Blogspot image with restricted size (' + matches[2] + ')');
		}
	});

	/* Use larger YouTube thumbnails. */
	Array.from(
		document.querySelectorAll('img[src*="//yt"][src*=".ggpht.com"]')
	).forEach(img => {
		let matches;
		if ((matches = img.src.match(/^(.*\/)s(\d+)([^/]+\/photo\.[^/.]+)$/)) && matches[2] < 1024) {
			let newSrc = matches[1] + 's1024' + matches[3];
			changeSrc(img, newSrc, 'found YouTube avatar with restricted size (' + matches[2] + ')');
		}
	});

	/* Get rid of all IMG@srcset attributes that have not been removed in the
	 * previous steps.
	 */
	[].forEach.call(
		document.querySelectorAll('img[srcset]'),
		function (img) {
			console.log('Load full images: removing srcset attribute: ', img);

			img.originalSrcset = img.getAttribute('srcset');
			img.removeAttribute('srcset');
		}
	);

	/* Make native VIDEO elements and video IFRAMEs take up the entire width
	 * of their offset parent. */
	var elementsToEnlargeSelectors = [
		'video',
		'iframe.twitter-tweet-rendered',
		'iframe[src*="embed"]',
		'iframe[src*="video"]',
		'iframe[src*="syndication"]',
		'iframe[class*="altura"]',
		'iframe[id*="altura"]',
		'iframe[src*="altura"]',
		'iframe[src*="//e.infogr.am/"]',
		'iframe[src*="//www.kickstarter.com/projects/"]',
		'iframe[src*="//media-service.vara.nl/player.php"]',
		'iframe[src*="//player.vimeo.com/video/"]'
	];

	[].forEach.call(
		document.querySelectorAll(elementsToEnlargeSelectors.join(', ')),
		function (element) {
			var scale = element.offsetParent.offsetWidth / element.offsetWidth;
			var newWidth = Math.round(element.offsetWidth * scale);
			var newHeight = Math.round(element.offsetHeight * scale);

			console.log(
				'Load full images: resizing element ', element,
				' from ' + element.offsetWidth + 'x' + element.offsetHeight
				+ ' to ' + newWidth + 'x' + newHeight
			);

			element.xxxJanReadableAllowStyle = true;
			element.style.width = newWidth + 'px';
			element.style.height = newHeight + 'px';
		}
	);

	/* Show controls on AUDIO and VIDEO elements. */
	[].forEach.call(
		document.querySelectorAll('audio, video'),
		function (element) {
			element.controls = true;
		}
	);

	/* Show controls on YouTube embeds. */
	[].forEach.call(
		document.querySelectorAll('iframe[src^="https://www.youtube.com/embed/"][src*="?"][src*="=0"]'),
		function (iframe) {
			var beforeAndAfterHash = iframe.src.split('#');
			var beforeAndAfterQuery = beforeAndAfterHash[0].split('?');


			var newPrefix = beforeAndAfterQuery[0];

			var newQueryString = '';
			if (beforeAndAfterQuery.length > 1) {
				beforeAndAfterQuery.shift();

				var newQueryParts = beforeAndAfterQuery
					.join('?')
					.split('&')
					.filter(function (keyValuePair) {
						return !keyValuePair.match(/^(controls|showinfo|rel)=0$/);
					}
				);

				if (newQueryParts.length) {
					newQueryString = '?' + newQueryParts.join('&');
				}
			}

			var newHash = '';
			if (beforeAndAfterHash.length > 1) {
				beforeAndAfterHash.shift();
				newHash = '#' + beforeAndAfterHash.join('#');
			}

			var newSrc = newPrefix + newQueryString + newHash;

			if (newSrc !== iframe.src) {
				iframe.src = newSrc;
			}
		}
	);

	/**
	 * Crudely calculate the similarity between two strings. Taken from
	 * https://stackoverflow.com/a/10473855. An alternative would be the
	 * Levenshtein distance, implemented in JavaScript here:
	 * https://andrew.hedges.name/experiments/levenshtein/
	 */
	function getSimilarity(strA, strB) {
		var result = 0;

		var i = Math.min(strA.length, strB.length);

		if (i === 0) {
			return;
		}

		while (--i) {
			if (strA[i] === strB[i]) {
				continue;
			}

			if (strA[i].toLowerCase() === strB[i].toLowerCase()) {
				result++;
			} else {
				result += 4;
			}
		}

		return 1 - (result + 4 * Math.abs(strA.length - strB.length)) / (2 * (strA.length + strB.length));
	}

	/**
	 * Change the IMG@src and fall back to the original source if the new
	 * source triggers an error. You can specify an array of new sources that
	 * will be tried in order. When all of the new sources fail, the original
	 * source will be used.
	 */
	function changeSrc(img, newSrc, reason)
	{
		var basename = img.src.replace(/[?#].*/, '').replace(/.*?([^\/]*)\/*$/, '$1');

		console.log('[' + basename + '] Load full images: ' + reason + ': ', img);

		if (img.hasNewSource) {
			console.log('[' + basename + '] Image already has a new source: ', img);
			return;
		}

		var newSources = Array.isArray(newSrc)
			? newSrc
			: [ newSrc ];

		while ((newSrc = newSources.shift())) {
			if (newSrc && img.src !== newSrc) {
				break;
			}
		}

		if (!newSrc) {
			return;
		}

		console.log('[' + basename + '] → Old img.src: ' + img.src);
		console.log('[' + basename + '] → Try img.src: ' + newSrc);

		/* Save the original source. */
		if (!img.originalSrc) {
			img.originalSrc = img.src;
		}

		if (!img.originalNaturalWidth) {
			img.originalNaturalWidth = img.naturalWidth;
		}

		if (!img.originalNaturalHeight) {
			img.originalNaturalHeight = img.naturalHeight;
		}

		/* Save and disable the srcset on the IMG element. */
		if (img.hasAttribute('srcset')) {
			img.originalSrcset = img.getAttribute('srcset');
			img.removeAttribute('srcset');
		}

		/* Save and disable the srcset in the container PICTURE element's SOURCE descendants. */
		if (img.parentNode.tagName.toLowerCase() === 'picture') {
			[].forEach.call(
				img.parentNode.querySelectorAll('source[srcset]'),
				function (source) {
					source.originalSrcset = source.getAttribute('srcset');
					source.removeAttribute('srcset');
				}
			);
		}

		/* When the new source has failed to load, load the next one from the
		 * list of possible new sources. If there are no more left, revert to
		 * the original source. */
		var errorHandler;

		if (newSources.length) {
			console.log('[' + basename + '] Setting errorHandler to loadNextNewSrc for ', img, '; newSources: "' + newSources.join('", "') + '"; reason:', reason);
			errorHandler = function loadNextNewSrc() {
				img.removeEventListener('error', loadNextNewSrc);
				changeSrc(img, newSources, reason);
			};
		} else {
			console.log('[' + basename + '] Setting errorHandler to restoreOriginalSrc for ', img, '; originalSrc: "' + img.originalSrc + '"; reason:', reason);
			errorHandler = function restoreOriginalSrc() {
				console.log('[' + basename + '] Load full images: error while loading new source for image: ', img);
				console.log('[' + basename + '] → Unable to load new img.src:    ' + newSrc);
				console.log('[' + basename + '] → Resetting to original img.src: ' + img.originalSrc);

				img.removeEventListener('error', restoreOriginalSrc);

				/* Restore the original source. */
				img.src = img.originalSrc;

				/* Re-enable the original srcset on the IMG element. */
				if (img.originalSrcset) {
					img.setAttribute('srcset', img.originalSrcset);
					delete img.originalSrcset;
				}

				/* Re-enable the original srcset in the container PICTURE element's SOURCE descendants. */
				if (img.parentNode.tagName.toLowerCase() === 'picture') {
					[].forEach.call(
						img.parentNode.querySelectorAll('source'),
						function (source) {
							if (source.originalSrcset) {
								source.setAttribute('srcset', source.originalSrcset);
								delete source.originalSrcset;
							}
						}
					);
				}

			};
		}

		img.addEventListener('error', errorHandler);

		/* When the new source image is smaller than the original image,
		 * treat that as an error, too. */
		img.addEventListener('load', function () {
			if (img.naturalWidth * img.naturalHeight < img.originalNaturalWidth * img.originalNaturalHeight) {
				console.log('[' + basename + '] Load full images: new image (', img.naturalWidth, 'x', img.naturalHeight, ') is smaller than old image (', img.originalNaturalWidth, 'x', img.originalNaturalHeight, '): ', img);

				return errorHandler();
			}

			if (img.src !== img.originalSrc) {
				console.log('[' + basename + '] → Success:     ' + img.src);
				img.hasNewSource = true;
			}
		});

		/* Finally, actually try to load the image. */
		img.src = newSrc;
	}
})();
