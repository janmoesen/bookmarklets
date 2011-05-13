/**
 * Show a minimal HTML page linking to the current page.
 *
 * @title Link this
 */
(function link() {
	var fragroot = document.createDocumentFragment().appendChild(document.createElement('html')),
	    title = fragroot.appendChild(document.createElement('title')),
	    titleText = (document.title && document.title + ' [' + (document.domain || location) + ']') || location,
	    iconLink = document.querySelector('link[rel*="icon"]') || document.createElement('link');

	/* Make sure the favicon HREF is absolute. If there was none, use Google S2. */
	iconLink.href = iconLink.href || 'http://www.google.com/s2/favicons?domain=' + document.domain;
	iconLink.rel = 'icon';
	fragroot.appendChild(iconLink.cloneNode(true));

	/* Also put the favicon in front of the link. */
	fragroot.appendChild(document.createElement('img')).src = iconLink.href;
	fragroot.appendChild(document.createTextNode(' '));

	/* Link to the current page using its title. */
	var link = fragroot.appendChild(document.createElement('a'));
	link.href = location;
	link.textContent = title.textContent = titleText;

	/* Open the data: URI with existing %XX encodings intact. */
	document.location = 'data:text/html;charset=UTF-8,' + fragroot.innerHTML.replace(/%/g, '$&' + 25);
})();
