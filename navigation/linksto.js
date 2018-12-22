/**
 * Highlight all links and images with the given text in their URL.
 *
 * @title Links to…
 */
(function linksto() {
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
		s = getActiveSelection();
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (document.janbmLinksToUrlText === undefined) {
		/* Default to looking for links to my domain. */
		document.janbmLinksToUrlText = 'jan.moesen.nu';

		/* If no search string was given, prompt for one. */
		if (s === '') {
			s = prompt('Please enter the text to look for in the URLs:', document.janbmLinksToUrlText);
		}
		if (s !== '') {
			document.janbmLinksToUrlText = s;
		}
	} else if (s !== '' && s !== document.janbmLinksToUrlText) {
		/* Overwrite the saved search string and restart from the first result. */
		document.janbmLinksToUrlText = s;
		delete document['janbmLinksToIndex'];
	}

	/* Use four overlays to cut out a rectangular area around the element, like the opposite of the CSS clip property. */
	var overlays = Array.prototype.slice.call(document.querySelectorAll('div[id^="janbmLinksToOverlay"]'));
	if (!overlays.length) {
		overlays = [];
		for (var i = 0; i < 4; i++) {
			overlays[i] = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
			overlays[i].setAttribute('id', 'janbmLinksToOverlay' + i);
			/* Clear the spotlighting when the user clicks on a masking overlay. */
			overlays[i].onclick = function () {
				overlays.forEach(function (overlay) {
					overlay.style.display = 'none';
				});
			};
			document.body.appendChild(overlays[i]);
		};
	}

	document.janbmLinksToIndex = 'janbmLinksToIndex' in document
		? document.janbmLinksToIndex + 1
		: 0;

	var all = document.querySelectorAll('[href*="' + document.janbmLinksToUrlText + '"], [src*="' + document.janbmLinksToUrlText + '"]');
	if (!all.length || document.janbmLinksToIndex >= all.length) {
		/* Clear the spotlighting when we have done them all. */
		overlays.forEach(function (overlay) {
			overlay.style.display = 'none';
		});

		delete document['janbmLinksToIndex'];
		return;
	}

	var element = all[document.janbmLinksToIndex];
	if (!element) {
		return;
	}

	console.debug('Links to: found element: ', element);
	element.scrollIntoView();
	element.focus();

	var left = 0, top = 0, width = element.offsetWidth, height = element.offsetHeight;
	var tmpElement = element;
	do {
		left += tmpElement.offsetLeft;
		top += tmpElement.offsetTop;
	} while ((tmpElement = tmpElement.offsetParent));
	if (element.nodeName.toLowerCase() === 'a' && element.children.length === 1) {
		/* Images (and possibly other elements) in links are higher than the links themselves. */
		height = Math.max(element.offsetHeight, element.children[0].offsetHeight);
	}

	/* Cut-out using overlays:
	 * AAAAAAA
	 * BB   CC
	 * DDDDDDD
	 */
	var overlayStyle = 'display: block; position: absolute; left: {left}px; top: {top}px; width: {width}px; height: {height}px; background: #333; opacity: 0.85;';
	overlays[0].setAttribute('style', overlayStyle
		.replace('{left}', 0)
		.replace('{top}', 0)
		.replace('{width}', document.documentElement.scrollWidth)
		.replace('{height}', top)
	);
	overlays[1].setAttribute('style', overlayStyle
		.replace('{left}', 0)
		.replace('{top}', top)
		.replace('{width}', left)
		.replace('{height}', height)
	);
	overlays[2].setAttribute('style', overlayStyle
		.replace('{left}', left + width)
		.replace('{top}', top)
		.replace('{width}', document.documentElement.scrollWidth - width - left)
		.replace('{height}', height)
	);
	overlays[3].setAttribute('style', overlayStyle
		.replace('{left}', 0)
		.replace('{top}', top + height)
		.replace('{width}', document.documentElement.scrollWidth)
		.replace('{height}', document.documentElement.scrollHeight - height - top)
	);
})()
