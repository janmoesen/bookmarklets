/**
 * Look up the specified or selected text using Merriam-Webster.
 *
 * @title Merriam-Webster
 */
(function mw() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://www.merriam-webster.com/wdictionary/' + encodeURIComponent(s);
	}
})();
