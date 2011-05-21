/**
 * Add the links' HREFs to their tooltips.
 *
 * @title Add link titles
 */
(function linktitles() {
	Array.prototype.slice.call(document.links).forEach(function (link) {
		if (link.title.indexOf(link.href) < 0) {
			link.title = link.title
				? link.title + ' [' + link.href + ']'
				: link.href;
		}
	});
})();
