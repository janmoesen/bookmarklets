/**
 * Show the Google Search "Cached" links after the page title.
 *
 * The "Cached" links used to be more visible, but now they are hidden in the
 * expandotron popup.
 *
 * @title Show Google "Cached" links
 */
(function gcshow() {
	/* Get all "Cached" links. */
	var cacheLinks = document.evaluate('//a[contains(@href, "q=cache:")][text() = "Cached"]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

	for (var i = 0; i < cacheLinks.snapshotLength; i++) {
		var cacheLink = cacheLinks.snapshotItem(i);

		var parentNode = cacheLink;
		while ((parentNode = parentNode.parentNode) && parentNode.classList) {
			/* This is the single result container. */
			if (parentNode.classList.contains('g')) {
				/* This is the page title link. */
				var urlContainer = parentNode.querySelector('h3 a.l');

				/* Move the "Cached" link after the page title. */
				cacheLink.setAttribute('style', 'margin-left: 1em; font-size: smaller;');
				cacheLink.textContent = '[' + cacheLink.textContent + ']';
				urlContainer.parentNode.appendChild(cacheLink);
			}
		}
	}
})();
