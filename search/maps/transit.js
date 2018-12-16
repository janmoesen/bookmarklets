/**
 * Search Google Maps for a route using public transit.
 *
 * @title Google Maps (for transit)
 */
(function transit() {
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
		s = getActiveSelection() || prompt('Please enter your Google Maps public transit query (e.g. "from Paris Charles de Gaulle to Paris Nord TGV"):');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		s = s.replace(/^\s*from\s+/g, 'from:');
		s = s.replace(/\s+(to|–)\s+/g, ' to:');

		if (s.match(/\sto:/) && !s.match(/^\s*from:/)) {
			s = 'from:' + s;
		}

		var locations = s.split(/\s+to\s*:\s*/);

		var url = 'https://www.google.com/maps/';

		if (locations.length === 1) {
			/* If there is just one location, show the normal search results. */
			url += 'search/' + locations.map(encodeURIComponent);
		} else {
			/* If there are several locations, show the directions. See
			   https://mstickles.wordpress.com/2015/06/12/gmaps-urls-options/
			   for more information on what these "data" options mean.
			   Basically: 3e3 = transit, 4e0 = show in km.
			*/
			url += 'dir/data=!4m3!4m2!3e3!4e0/';
			url += locations.map(function (str) {
				return encodeURIComponent(
					str.replace(/^\s*(from|to)\s*:\s*/, '')
				);
			}).join('/');
		}

		/* Make the final URL more readable. */
		location = url
			.replace(/%20/g, '+')
			.replace(/%2C/g, ',')
			.replace(/%3A/g, ':')
		;
	}
})();
