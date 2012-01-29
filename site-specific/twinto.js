/**
 * Scroll to the first tweet of the latest updates.
 *
 * When loading new Tweets on twitter.com, I find it hard to resume where I had
 * left off.
 *
 * (The name "Twinto" is an obligatory <"tw" + word> style pun, and quite a
 * grating one at that: "tw" + scrollIntoView. You're welcome.)
 *
 * @title Twinto
 */
(function twinto() {
	/* "Last" for Twitter is actually "first" in chronological order. */
	var firstNewTweet = document.querySelector('.last-new-tweet');
	if (firstNewTweet) {
		/* Add a bit of styling to make it stand out. */
		firstNewTweet.style.outline = '5px outset lightblue';

		/* Scroll to the second new tweet, past the top bar. */
		firstNewTweet.previousElementSibling
			? firstNewTweet.previousElementSibling.scrollIntoView()
			: firstNewTweet.scrollIntoView();
	}
})();
