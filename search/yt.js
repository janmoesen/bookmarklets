/**
 * Search YouTube for the specified or selected text.
 *
 * If the text looks like a video ID, you are taken directly to the video.
 *
 * If you append a "!" to the video ID, it will be opened in an IFRAME, so you
 * do not need to sign in for "restricted" videos.
 *
 * @title YouTube search
 */
(function yt() {
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
		s = getActiveSelection() || prompt('Please enter your YouTube search query (or jump directly to a 11-character video ID, optionally followed by " !"):');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		s = s.replace(/\uFEFF/g, '');

		/* Check if the parameter looks like an 11-character video ID, or just a search string. */
		var matches;
		if ((matches = s.match(/^([-_a-zA-Z0-9]{11})( *!)?$/)) && !s.match(/^(([A-Z]?[a-z]+)|([A-Z]+))$/)) {
			if (matches[2]) {
				var html = '<iframe width="854" height="510" src="https://www.youtube.com/embed/' + encodeURIComponent(matches[1]) + '"></iframe>';

				/* Replace the original document's HTML with our generated HTML. */
				HTMLDocument.prototype.open.call(document, 'text/html; charset=UTF-8');
				HTMLDocument.prototype.write.call(document, html);
				HTMLDocument.prototype.close.call(document);
			} else {
				location = 'https://www.youtube.com/watch?v=' + encodeURIComponent(s);
			}
		} else {
			/* See if the search should filter (e.g. only videos, only playlists,
			 * only live streams, …).
			 *
			 * You can only specify one filter, e.g. “yt --long autechre”.
			 *
			 * See the source code below this comment for supported filters.
			 */
			var filters = {
				'video': 'EgIQAQ==',
				'channel': 'EgIQAg==',
				'playlist': 'EgIQAw==',

				'short': 'EgIYAQ==',
				'long': 'EgIYAg==',

				'live': 'EgJAAQ=='
			};

			if ((matches = s.match(new RegExp('^\\s*--(' + Object.keys(filters).join('|') + ')\\s+(.*)$')))) {
				var filterName = matches[1];
				s = matches[2];
				location = 'https://www.youtube.com/results?sp=' + filters[filterName] + '&search_query=' + encodeURIComponent(s);
			} else {
				location = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s);
			}
		}
	}
})();
