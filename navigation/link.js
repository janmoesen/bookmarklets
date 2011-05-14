/**
 * Show a minimal HTML page linking to the current page.
 *
 * @title Link this
 */
(function link() {
	var fragmentRoot = document.createDocumentFragment().appendChild(document.createElement('html')),
	    fragmentTitle = fragmentRoot.appendChild(document.createElement('title')),
	    titleText = document.querySelector('title') && document.querySelector('title').textContent || document.title,
	    iconLink = document.querySelector('link[rel*="icon"]') || document.createElement('link');

	/* Make sure the favicon HREF is absolute. If there was none, use Google S2. */
	iconLink.href = iconLink.href || 'http://www.google.com/s2/favicons?domain=' + document.domain;
	iconLink.rel = 'icon';
	fragmentRoot.appendChild(iconLink.cloneNode(true));

	/* Also put the favicon in front of the link. */
	fragmentRoot.appendChild(document.createElement('img')).src = iconLink.href;
	fragmentRoot.appendChild(document.createTextNode(' '));

	/* Link to the current page using its title. */
	var link = fragmentRoot.appendChild(document.createElement('a'));
	link.href = location;
	link.textContent = fragmentTitle.textContent = titleText ? titleText + ' [' + (document.domain || location) + ']' : location,

	/* Open the data: URI with existing %XX encodings intact. */
	document.location = 'data:text/html;charset=UTF-8,' + fragmentRoot.innerHTML.replace(/%/g, '$&' + 25);
})();
