/**
 * Link directly to blogspot.com images, instead of to an intermediate page.
 *
 * @title Blogspot
 */
(function blogspot() {
	Array.prototype.slice.call(document.querySelectorAll('a[href*="bp.blogspot.com/"][href*="-h/"] > img[src*="bp.blogspot.com/"]:first-child:last-child')).forEach(function (img) {
		img.parentNode.href = img.parentNode.href.replace(/\/(s[0-9]+)-h\//, '/$1/');
	});
})();
