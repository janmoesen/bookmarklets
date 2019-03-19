/**
 * Show the currently playing track in the window/tab title on SomaFM Player
 * pages like https://somafm.com/player/#/now-playing/cliqhop
 *
 * @title SomaFM np
 */
(function somanp() {
	var playlistContainer = document.querySelector('.now-playing .list-body');
	if (!playlistContainer) {
		return;
	}

	var originalTitle = document.title;

	function updateTitle() {
		var artistNode = playlistContainer.querySelector('.row > :nth-child(2)');
		var titleNode = playlistContainer.querySelector('.row > :nth-child(3)');

		if (!artistNode || !titleNode) {
			return;
		}

		document.title = artistNode.textContent
			+ ' - ' + titleNode.textContent.toLowerCase()
			+ ' | ' + originalTitle;
	}

	var observer = new MutationObserver(updateTitle);

	observer.observe(playlistContainer, {
		childList: true,
		subtree: true
	});

	updateTitle();
})();
