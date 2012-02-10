/**
 * Look up the specified or selected text in the French Wikipedia.
 *
 * @title French Wikipedia
 */
(function frw() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		/* The Wikipedia search works like "I'm feeling lucky" on most Wikipedia instances. If there is a complete match, it will redirect us there. */
		location = 'http://fr.wikipedia.org/w/index.php?title=Special%3ASearch&search=' + encodeURIComponent(s);
	}
})();
