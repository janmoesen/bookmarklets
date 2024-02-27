/**
 * Restore window.console to its native state.
 *
 * @title Re-console
 */
(function reconsole() {
	'use strict';

	/* Sometimes all it takes to revert back to the original `console`, is to
	 * delete the imposter. */
	delete window.console;

	/* But if that didn’t work, create an IFRAME and use its `console`. */
	if (!window.console) {
		const iframe = document.body.appendChild(document.createElement('iframe'));
		window.console = iframe.contentWindow.console;
	}
})();
