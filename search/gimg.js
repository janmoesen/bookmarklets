/**
 * Search Google Images, optionally limiting to certain sizes using:
 * - "wallpaper" word to find images the size of your screen.
 * - "640x480" to find images with exactly those dimensions
 * - ">1600x1200" to find images approximately larger than 1600x1200
 * - ">4mp" to find images approximately larger than 4 megapixels (2272x1704)
 *
 * @title Google Images
 */
(function gimg() {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(doc) {
		if (arguments.length === 0) {
			doc = document;
		}

		if (!doc || typeof doc.getSelection !== 'function') {
			return '';
		}

		if (!doc.activeElement) {
			return doc.getSelection() + '';
		}

		var activeElement = doc.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return doc.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return doc.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection() || prompt('Please enter your Google Images search query or image URL:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		var words = s.split(' '), matches;

		/* If the first parameter looks like a URL, use Google Image Search. */
		if (words[0].match(/^(\w+:(\/\/)?)?[^\s]+(\.[^\s]+)+\//))
		{
			location = 'https://www.google.com/searchbyimage?sbisrc=cr_1_5_2&image_url=' + encodeURIComponent(words[0]) + '&q=' + encodeURIComponent(words.slice(1).join(' '));
			return;
		}

		var url = 'https://www.google.com/search?tbm=isch&safe=off&gws_rd=cr&ei=';
		if (words.length > 1) {
			if (words[0] === 'wallpaper') {
				words[0] = screen.width + 'x' + screen.height;
			}

			if ((matches = words[0].match(/^=?([0-9]+)x([0-9]+)$/))) {
				/* Exact size requested. */
				url += '&tbs=isz:ex,iszw:' + encodeURIComponent(matches[1]) + ',iszh:' + encodeURIComponent(matches[2]);
				words.shift();
			} else if ((matches = words[0].match(/^>(([1-9][0-9]*)x([1-9][0-9]*)|qsvga|vga|svga|xga|(?:([1-9][0-9]*)mp))$/))) {
				var minWidth = matches[2] * 1, minHeight = matches[3] * 1, minMegapixels = matches[4] * 1;
				/* "Larger than X" requested. */
				var resolutions = {
					'400x300': 'qsvga',
					'640x480': 'vga',
					'800x600': 'svga',
					'1024x768': 'xga',
					'1600x1200': '2mp',
					'2272x1704': '4mp',
					'2816x2112': '6mp',
					'3264x2448': '8mp',
					'3648x2736': '10mp',
					'4096x3072': '12mp',
					'4480x3360': '15mp',
					'5120x3840': '20mp',
					'7216x5412': '40mp',
					'9600x7200': '70mp'
				};
				var size = matches[1];
				if (minWidth && minHeight) {
					for (var dimensions in resolutions) {
						var width = dimensions.split('x')[0] * 1, height = dimensions.split('x')[1] * 1;
						if (minWidth >= width && minHeight >= height) {
							size = resolutions[dimensions];
						}
					}
				} else if (minMegapixels) {
					for (var dimensions in resolutions) {
						var megapixels = parseInt(resolutions[dimensions], 10);
						if (minMegapixels >= megapixels) {
							size = resolutions[dimensions];
						}
					}
				}
				url += '&tbs=isz:lt,islt:' + encodeURIComponent(size);
				words.shift();
			}
			s = words.join(' ');
		}
		location = url + '&q=' + encodeURIComponent(s);
	}
})();
