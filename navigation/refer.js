/**
 * Go to the specified or selected URL using the current page as the referrer.
 *
 * @title Surf with referrer
 */
(function refer() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter the destination URL:');
	if (s) {
		location = s;
	}
})();
