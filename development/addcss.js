/**
 * Add the specified CSS to the current document.
 *
 * @title Add CSS
 */
(function addcss() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your CSS code:');
	if (s) {
		document.head.appendChild(document.createElement('style')).textContent = s;
	}
})();
