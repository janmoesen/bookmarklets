/**
 * Get rid of common overlays, such as full-page ads.
 *
 * @title Kill overlays
 * @keyword kill-overlays
 */
(function killOverlays() {
	/* Remove known overlays. */
	var selectors = [
		'body [class^="nyroModal"]',
		'.optimonk-holder',
		'#spout-friendly-iframe',
	];

	[].forEach.call(
		document.querySelectorAll(selectors.join(', ')),
		function (elem) {
			elem.parentNode.removeChild(elem);
		}
	);

	/* Remove "suspicious" elements. */
	var selectors = [
		'body [class*="modal"]',
		'body [class*="overlay"]',
		'body [class*="popup"]',
		'body [style*="width"][style*="height"][style*="100%"]',
		'.frame-container',
		'iframe[style]',
	];

	[].forEach.call(
		document.querySelectorAll(selectors.join(', ')),
		function (elem) {
			if (elem.offsetWidth / window.innerWidth > 0.75 || elem.offsetHeight / window.innerHeight > 0.75) {
				elem.parentNode.removeChild(elem);
			}
		}
	);

	/* Re-enable scrolling on Quora.com. */
	document.body.classList.remove('login_no_scroll');

	/* Re-enable scrolling disabled by inline styles. */
	[].forEach.call(
		document.querySelectorAll('[style*="overflow"][style*="hidden"]'),
		function (elem) {
			elem.setAttribute('style', elem.getAttribute('style').replace(/overflow\s*:\s*hidden\s*;?/, ''));
		}
	);
})();
