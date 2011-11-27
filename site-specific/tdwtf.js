/**
 * Fix the forum for The Daily WTF after having applied Readable++.
 *
 * @title TDWTF
 */
(function tdwtf() {
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
		tr:hover th, tr:hover td:not(.code), tr th:hover, tr td:not(.code):hover {
			background: inherit;
		}
	';
})();
