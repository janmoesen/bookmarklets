/**
 * Look up the specified or selected text using Thesaurus.com.
 *
 * @title Thesaurus.com
 */
(function thes() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://thesaurus.reference.com/browse/' + encodeURIComponent(s);
	}
})();
