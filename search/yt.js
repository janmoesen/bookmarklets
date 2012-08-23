/**
 * Search YouTube for the specified or selected text.
 *
 * If the text looks like a video ID, you are taken directly to the video.
 *
 * @title YouTube
 */
(function yt() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		if (s.match(/^[-_a-zA-Z0-9]{11}$/) && s.match(/[A-Z][a-z]|[a-z][A-Z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]/)) {
			location = 'http://www.youtube.com/watch?v=' + encodeURIComponent(s);
		} else {
			location = 'http://www.youtube.com/results?search_query=' + encodeURIComponent(s);
		}
	}
})();
