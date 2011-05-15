/**
 * Show a minimal HTML page linking to the current page.
 *
 * @title Link this
 */
(function link() {
	var root = document.createDocumentFragment().appendChild(document.createElement('html')),
	    titleText = document.querySelector('title') && document.querySelector('title').textContent || document.title,
	    originalIconLink = document.querySelector('link[rel*="icon"]'),
	    domain = document.domain || location.hostname;

	/* Build a basic HTML document for easy element access. */
	root.innerHTML = '<head><title></title><link rel="icon"><style>html { font-family: "Calibri", sans-serif; }</style><body><p><img> <a></a>';
	var title = root.querySelector('title'),
	    iconLink = root.querySelector('link'),
	    styleSheet = root.querySelector('style'),
	    iconImage = root.querySelector('img'),
	    link = root.querySelector('a');

	/* Make sure the favicon HREF is absolute. If there was none, use Google S2. */
	iconLink.href = iconImage.src = originalIconLink && originalIconLink.href || 'http://www.google.com/s2/favicons?domain=' + domain;

	/* Link to the current page using its title. */
	link.href = location;
	link.textContent = title.textContent = titleText ? titleText : location;
	if (titleText) {
		link.parentNode.insertBefore(document.createTextNode(' [' + domain + ']'), link.nextSibling);
	}

	/* Open the data: URI with existing %XX encodings intact. */
	document.location = 'data:text/html;charset=UTF-8,' + root.innerHTML.replace(/%/g, '$&' + 25);
})();
