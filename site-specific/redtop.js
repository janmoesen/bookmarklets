/**
 * Show the top posts for the current/selected subreddit.
 *
 * I hardly ever use Reddit, but when I do, I’m most likely looking at a
 * humour-related subreddit to have a laugh, so “just play the hits, dammit!”.
 *
 * @title Subreddit’s top posts
 */
(function redtop() {
	'use strict';

	/* Try to get the parameter string from the bookmarklet/search query.
	 * Fall back to the current text selection, if any. If those options
	 * both fail, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(document) {
		if (!document || typeof document.getSelection !== 'function') {
			return '';
		}

		if (!document.activeElement) {
			return document.getSelection() + '';
		}

		const activeElement = document.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return document.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return document.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection(document);
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection(document) + '$2');
	}

	const subredditRegexp = /\b(?<redditUrlPrefix>https?:\/\/([^\/]+\.)?reddit\.com\/)?(?<subredditName>r\/[a-zA-Z0-9_-]+)/;

	/* Check the bookmarklet parameter or the selected text. */
	let subredditMatches = s.match(subredditRegexp);

	/* Check the current URL. */
	if (!subredditMatches) {
		subredditMatches = location.href.match(subredditRegexp);
	}

	/* Prompt for the subreddit name or URL. */
	if (!subredditMatches) {
		s = prompt('Please enter the `r/SubredditNameHere` or the full `https://www.reddit.com/r/SubredditNameHere` URL to view its top posts.', location);
		subredditMatches = s.match(subredditRegexp);
	}

	if (!subredditMatches) {
		alert(`“${s}”  does not look like a valid subreddit.`);
		return;
	}

	location = (subredditMatches.groups.redditUrlPrefix || 'https://www.reddit.com/')
		+ subredditMatches?.groups.subredditName
		+ '/top/?sort=top&t=all';
})();
