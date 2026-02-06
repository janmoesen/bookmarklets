/**
 * Search YouTube for the specified or selected text, using Invidious (“an
 * alternative front-end to YouTube”).
 *
 * If the text looks like a video ID, you are taken directly to the video.
 *
 * If you append a "!" to the video ID, it will be opened in an IFRAME, so you
 * do not need to sign in for "restricted" videos.
 *
 * There are several options you can use (and combine) to filter the results:
 *
 * --video
 * --channel
 * --playlist
 *       Search for videos/channels/playlists (default: all types)
 *
 * --short
 * --medium
 * --long
 *       Search for < 4 min / 4–20 min / > 20 min (default: all durations)
 *
 * --live
 * --hd
 * --4k
 *       Search for live video / HD video / 4K video
 *
 * --views (alias: --popular)
 * --date (alias: --recent)
 *       Order by view count / upload date (default: relevance)
 *
 * --topic (alias: --official)
 *       “Topic” videos are posted by the official channels for
 *       artists/bands/musicians and can be recognized by either “ - Topic” or
 *       “🎵” suffixed to the name. However, it is easier to search for the
 *       text “Provided to YouTube by”, which is at the start of the
 *       auto-generated description for music “videos”.
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
		/* See if we are on on Invidious instance and should switch back to the original YouTube. */
		const invidiousDetectorSelector = [
			'head link[title="Invidious"]',
			'script[id="video_data"][type="application/json"]',
			'a[href="https://github.com/iv-org/invidious"]',
		].join(', ');

		if (location.host !== 'www.youtube.com' && document.querySelector(invidiousDetectorSelector)) {
			if (location.pathname.match(/^\/(embed|watch|playlist|channel)($|\/)/)) {
				location.host = 'www.youtube.com';
				return;
			} else if (location.pathname === '/search') {
				let newUrl = new URL(location);
				newUrl.host = 'www.youtube.com';
				newUrl.pathname = '/results';
				const query = newUrl.searchParams.get('q');
				newUrl.search = '';
				newUrl.searchParams.set('search_query', query);
				location = newUrl;
				return;
			}
		}

		/* If we are not on Invidious, and no arguments were specified, prompt the user. */
		s = getActiveSelection() || prompt('Please enter your YouTube search query (or jump directly to a 11-character video ID, optionally followed by " !"):');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		s = s.replace(/\uFEFF/g, '');

		/* Check if the parameter looks like an 11-character video ID, or just a search string. */
		var matches;
		if ((matches = s.match(/^([-_a-zA-Z0-9]{11})( *!)?$/)) && !s.match(/^(([A-Z]?[a-z-]+)|([A-Z-]+))$/)) {
			if (matches[2]) {
				var html = '<iframe width="854" height="510" src="https://inv.nadeko.net/embed/' + encodeURIComponent(matches[1]) + '"></iframe>';

				/* Replace the original document's HTML with our generated HTML. */
				HTMLDocument.prototype.open.call(document, 'text/html; charset=UTF-8');
				HTMLDocument.prototype.write.call(document, html);
				HTMLDocument.prototype.close.call(document);
			} else {
				location = 'https://inv.nadeko.net/watch?v=' + encodeURIComponent(s);
			}
		} else {
			/* See if the search should filter (e.g. only videos, only playlists,
			 * only live streams, …).
			 *
			 * You can specify more than one filter, e.g. “yt --long --hd autechre”.
			 *
			 * See the source code below this comment for supported filters.
			 */
			var filters = {
				video: {
					type: 'video',
				},

				channel: {
					type: 'channel',
				},

				playlist: {
					type: 'playlist',
				},

				short: {
					duration: 'short',
				},

				medium: {
					duration: 'medium',
				},

				long: {
					duration: 'long',
				},

				live: {
					features: 'live',
				},

				hd: {
					features: 'hd',
				},

				'4k': {
					features: 'four_k',
				},

				views: {
					sort: 'views',
				},

				'sort=views': {
					sort: 'views',
				},

				popular: {
					sort: 'views',
				},

				'sort=popular': {
					sort: 'views',
				},

				date: {
					sort: 'date',
				},

				'sort=date': {
					sort: 'date',
				},

				recent: {
					sort: 'date',
				},

				'sort=recent': {
					sort: 'date',
				},

				'topic': {
				},

				'official': {
				},
			};

			let url = new URL('https://inv.nadeko.net/search');

			const filterRegexp = new RegExp('^\\s*--(' + Object.keys(filters).join('|') + ')\\s+(.*)$');
			while ((matches = s.match(filterRegexp))) {
				const filterName = matches[1];
				s = matches[2];
				Object.entries(filters[filterName]).forEach(([key, value]) => {
					url.searchParams.append(key, value);
				});

				if (filterName === 'topic' || filterName === 'official') {
					s += ' "Provided to YouTube by" OR "Auto-generated by YouTube"';
				}
			}

			url.searchParams.set('q', s);
			location = url;
		}
	}
})();
