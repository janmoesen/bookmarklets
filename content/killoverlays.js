/**
 * Get rid of common overlays, such as full-page ads.
 *
 * @title Kill overlays
 * @keyword killoverlays
 */
(function killOverlays() {
	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	var console = (function () {
		var iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			document.body.appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () { }
		};
	})();

	/* Remove known overlays. */
	var selectors = [
		'body [class^="nyroModal"]',
		'.optimonk-holder',
		'#spout-friendly-iframe',
		'.reveal-modal',
		'.reveal-modal-bg',
		'#colorbox',
		'.colorbox',
		'.ad.ad--wallpaper'
	];

	[].forEach.call(
		document.querySelectorAll(selectors.join(', ')),
		function (elem) {
			console.log('Kill overlays: removing known overlay ', elem);
			elem.parentNode.removeChild(elem);
		}
	);

	/* Remove "suspicious" elements. */
	var selectors = [
		'body [id*="modal"]',
		'body [id*="Modal"]',
		'body [class*="modal"]',
		'body [class*="Modal"]',
		'body [id*="overlay"]',
		'body [id*="Overlay"]',
		'body [class*="overlay"]',
		'body [class*="Overlay"]',
		'body [id*="popup"]',
		'body [id*="Popup"]',
		'body [class*="popup"]',
		'body [class*="Popup"]',
		'body [style*="width"][style*="height"][style*="100%"]',
		'body [style*="position"][style*="absolute"][style*="left"]',
		'body [style*="position"][style*="fixed"][style*="left"]',
		'.frame-container',
		'iframe[style]',
	];

	[].forEach.call(
		document.querySelectorAll(selectors.join(', ')),
		function (elem) {
			if (elem.offsetWidth / window.innerWidth > 0.75 || elem.offsetHeight / window.innerHeight > 0.75) {
				console.log('Kill overlays: removing suspiciously large element ', elem);
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
