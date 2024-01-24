/**
 * Load the full-size versions of resized images based on their "src"
 * attribute, or their containing link's "href" attribute. Also, make IFRAMEs
 * take up the entire width of their offset parent (useful for embedded videos
 * and whatnot). Same goes for the VIDEO elements.
 *
 * @title Load full images
 */
(function fullimg() {
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

	/* Show the original image for Simpleview CMS resized assets.
	 *
	 * Example:
	 * https://assets.simpleviewcms.com/simpleview/image/upload/c_fill,g_xy_center,h_640,w_640,x_1697,y_1559/f_jpg/q_65/v1/clients/norway/Tungeneset_Norway_1116ab05-08a0-463e-a41d-42d5b8c549eb.jpg?_a=BATCtdAA0
	 * https://assets.simpleviewcms.com/simpleview/image/upload/clients/norway/Tungeneset_Norway_1116ab05-08a0-463e-a41d-42d5b8c549eb.jpg?_a=BATCtdAA0
	 */
	[].forEach.call(
		document.querySelectorAll('img[src^="https://assets.simpleviewcms.com/simpleview/image/upload"][src*="/clients/"]'),
		function (img) {
			const oldSrc = img.src;
			newSrc = oldSrc.replace(/^(https:\/\/assets\.simpleviewcms\.com\/simpleview\/image\/upload\/)(.*\/)(clients\/)/, '$1/$3');
			if (newSrc !== oldSrc) {
				changeSrc(img, newSrc, 'found image with Simpleview CMS resized asset URL');
			}
		}
	);

	/* Show the original images when their full URL seems to be in the IMG@src path.
	 *
	 * Example:
	 * https://img.standaard.be/IHkuEg6LKexpi2zlGc744w6U2rM=/fit-in/1280x853/https%3A%2F%2Fstatic.standaard.be%2FAssets%2FImages_Upload%2F2023%2F08%2F03%2F979725c5-7a54-44db-8c59-689180ce8d54.jpg
	 */
	document.querySelectorAll('img[src*="/https"], img[src*="/http]').forEach(img => {
		const matches = img.src.match(/[=\/](https?(:|%3A)(%2F|\/){2}[^\/&?]+(\.jpe?g|png|gif))/i);
		if (matches && matches[1]) {
			changeSrc(img, decodeURIComponent(matches[1]), 'found image with likely source URL in its path');
		}
	});

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
	var thumbnailPathRegexp = /(.*[/.-])(small|thumbs?|thumbnails?|resized|previews?|medium)([/.-].*)/;

	var fullSizePathParts = [
		'large',
		'original',
		'originals',
		'source',
		'normal',
		'xlarge',
		'',
	];

	[].forEach.call(
		document.images,
		function (img) {
			var oldSrc = img.src;
			var matches = oldSrc.match(thumbnailPathRegexp);
			if (matches) {
				var newSources = [];

				fullSizePathParts.forEach(function (part) {
					if (part === '') {
						newSources.push(matches[1].replace(/\/$/, '') + part + matches[3]);
					} else {
						newSources.push(matches[1] + part + matches[3]);
					}
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

	/* Get rid of parameters whose value corresponds to the current image’s
	 * with or height, e.g. `foo.jpg?dim_w=123&dim_h=456` when the image’s
	 * `naturalWidth` is 123 and/or its `naturalHeight` is 456.
	 */
	document.querySelectorAll('img[src*="?"]').forEach(img => {
		const oldSrc = img.src;
		const imgUrl = new URL(oldSrc);
		imgUrl.searchParams.forEach((value, key) => {
			if (value == img.naturalWidth || value === img.naturalHeight) {
				imgUrl.searchParams.delete(key);
			}
		});

		const newSrc = imgUrl.toString();

		if (newSrc !== oldSrc) {
			changeSrc(img, newSrc, 'found image with query string parameter matching its width/height');
		}
	});

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

	/* Use larger YouTube/Google thumbnails. */
	Array.from(
		document.querySelectorAll('img[src*="//yt"][src*=".ggpht.com"], img[src*=".googleusercontent.com"]')
	).forEach(img => {
		let matches;
		if ((matches = img.src.match(/^(.*\/[A-Za-z0-9_-]{16,}=s)(\d+)([^/]+.*)$/)) && matches[2] < 1024) {
			let newSrc = matches[1] + 1024 + matches[3];
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

				/* For images that are viewed stand-alone, also update the address bar and title. */
				if (location.href === img.originalSrc) {
					history.replaceState({}, '', img.src);
					if (document.title.indexOf(basename) > -1) {
						const newBasename = img.src.replace(/[?#].*/, '').replace(/.*?([^\/]*)\/*$/, '$1');
						document.title = `${newBasename} (${img.naturalWidth} × ${img.naturalHeight} pixels)`;
					}
				}
			}
		});

		/* Finally, actually try to load the image. */
		img.src = newSrc;
	}
})();
