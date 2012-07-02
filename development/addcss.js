/**
 * Add the specified CSS to the current document.
 *
 * @title Add CSS
 */
(function addcss(document) {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your CSS code:');
	if (s) {
		document.head.appendChild(document.createElement('style')).textContent = s;
	}

	/* Recurse for frames and iframes. */
	try {
		Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
			addcss(elem.contentDocument);
		});
	} catch (e) {
		/* Catch exceptions for out-of-domain access, but do not do anything with them. */
	}
})(document);
