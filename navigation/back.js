/**
 * Go back to the previous page, or, failing that, to the referring page.
 *
 * @title Go back
 */
(function back() {
	if (history.length > 1) {
		history.back();
		/* Go to the referrer when back() did not seem to have worked. */
		window.setTimeout(goToReferrer, 250);
	} else {
		goToReferrer();
	}

	function goToReferrer() {
		if (document.referrer) {
			location = document.referrer;
		}
	}
})();
