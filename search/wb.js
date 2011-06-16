/**
 * View the Internet Archive Wayback Machine's latest cache for the specified URL.
 *
 * @title Wayback Machine
 */
(function wb() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your URL:', location);
	if (s) {
		location = 'http://wayback.archive.org/web/' + s;
	}
})();
