/**
 * Fix the forum for The Daily WTF after having applied Readable++.
 *
 * @title TDWTF
 */
(function tdwtf() {
	Array.prototype.slice.call(document.querySelectorAll('.ForumPostUserArea')).forEach(function (td) {
		td.rowSpan = 2;
	});
	document.head.appendChild(document.createElement('style')).textContent = '
		.ForumPostFooterArea, .ForumPostSignature {
			border-top: 1px dotted; font-size: smaller;
		}
		.ForumPostFooterArea li:empty {
			display: none;
		}
		.ForumPostUserContent {
			padding-right: 1em;
		}
		:visited, .ForumLastPost a {
			opacity: 0.25;
		}
	';
})();
