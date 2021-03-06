/**
 * Hide visual pollution from the Strava feed.
 *
 * “Pollution” is a highly subjective term, meaning “everything I do not care
 * enough about to want to see featured in the feed”. That means things like
 * very short rides (unless they have photos), short runs/hikes/walks, water
 * sports and winter sports, Zwift sessions, people joining clubs or
 * challenges, …
 *
 * @title Hide Strava pollution
 */
(function shide() {
	const css = `@charset "utf-8";
		.xxxJanStravaHidden {
			transition: max-height 0.25s ease-in 0s;

			overflow: hidden;
			max-height: 12ex;
			border-top: 0.5ex solid #fc4c02;
			opacity: 0.25;
		}

		.xxxJanStravaHidden:hover {
			transition:
				/* First fade in, then enlarge. */
				opacity 0.2s ease-in 0s,
				border-top-color 1s ease-in 0s,
				max-height 0.5s ease-out 1s;
			max-height: 1000vh;
			border-top: 0.5ex solid transparent;
			opacity: 1;
		}
	`;

	document.head.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'style')).textContent = css;

	/**
	 * Process a feed entry.
	 */
	function processEntry(entry) {
		/* Skip nested feed entries (i.e. inside a group activity) */
		if (entry.parentElement.closest('.feed-entry')) {
			return;
		}

		/* Feed entry types. */
		const entryClassList = entry.classList;
		const isActivity = entryClassList.contains('activity');
		const isGroupActivity = entryClassList.contains('group-activity');
		const isClub = entryClassList.contains('club');
		const isPromo = entryClassList.contains('promo');

		/* Tags. */
		const mapTag = entry.querySelector('.activity-map-tag');
		const workoutType = entry.querySelector('.workout-type');
		const isCommute = !!(mapTag || workoutType)?.textContent?.match(/commute/i);

		/* Activity types, taken from the CSS. */
		const appIconClassList = entry.querySelector('.entry-icon .app-icon, .entry-type-icon .app-icon, .group-activity-icon .app-icon')?.classList ?? { contains: _ => false };

		const isRide = appIconClassList.contains('icon-ride')
			|| appIconClassList.contains('icon-cycling');
		const isVirtualRide = appIconClassList.contains('icon-virtualride');
		const isEBikeRide = appIconClassList.contains('icon-ebikeride');

		const isRun = appIconClassList.contains('icon-run')
			|| appIconClassList.contains('icon-running');
		const isHike = appIconClassList.contains('icon-hike')
			|| appIconClassList.contains('icon-hiking');
		const isWalk = appIconClassList.contains('icon-walk')
			|| appIconClassList.contains('icon-walking');

		const isSwim = appIconClassList.contains('icon-swim')
			|| appIconClassList.contains('icon-swimming');
		const isWaterSport = appIconClassList.contains('icon-watersport');

		const isWinterSport = appIconClassList.contains('icon-wintersport')
			|| appIconClassList.contains('icon-snow')
			|| appIconClassList.contains('icon-snowboard')
			|| appIconClassList.contains('icon-snowshoe')
			|| appIconClassList.contains('icon-alpineski')
			|| appIconClassList.contains('icon-nordicski')
			|| appIconClassList.contains('icon-backcountryski');

		const isOther = appIconClassList.contains('icon-other')
			|| appIconClassList.contains('icon-workout');

		/* Media. */
		const numPhotos = entry.querySelectorAll('[str-type="photo"]').length;
		const hasPhotos = numPhotos > 0;

		const hasMap = !!entry.querySelector('.activity-map');

		/* Statistics. */
		let distanceInKm = undefined;
		let hasDistanceInKm = false;

		let elevationInM = undefined;
		let hasElevationInM = false;

		let durationInS = undefined;
		let hasDurationInS = false;

		/* The DOM structure for the activity stats differs between the feed
		 * entries on the dashboard and those on the athlete page. Also,
		 * because group activities have the stats for all participants,
		 * use `.reverse()` to process the first athlete’s stats last. */
		Array.from(entry.querySelectorAll('.list-stats li')).reverse().forEach(stat => {
			const label = stat.querySelector('.stat-subtext')?.textContent?.trim() || stat.title || '';
			const value = stat.querySelector('.stat-text')?.textContent?.trim() || stat.textContent.trim();

			/* TODO: add support/conversion for backwards non-SI units <https://i.redd.it/o093x6j57dk41.jpg> */
			if (label.match(/^distance/i)) {
				let matches = value.match(/\b([0-9]+(\.[0-9]*))\s*km\s*$/);
				if (matches) {
					hasDistanceInKm = true;
					distanceInKm = parseFloat(matches[1]);
				}
			} else if (label.match(/^elev\S* gain/i)) {
				let matches = value.match(/\b([0-9]+)\s*m\s*$/);
				if (matches) {
					hasElevationInM = true;
					elevationInM = parseFloat(matches[1]);
				}
			} else if (label.match(/^time/i)) {
				let tmpDurationInS = 0;
				let hasParsedDuration = true;

				value.split(/\s([0-9]+\s*[^0-9]+)\s*/).forEach(durationPart => {
					let matches;
					if (durationPart.trim() === '') {
					} else if ((matches = durationPart.match(/^\s*([0-9]+)s/))) {
						tmpDurationInS += parseInt(matches[1], 10);
					} else if ((matches = durationPart.match(/^\s*([0-9]+)m/))) {
						tmpDurationInS += parseInt(matches[1], 10) * 60;
					} else if ((matches = durationPart.match(/^\s*([0-9]+)h/))) {
						tmpDurationInS += parseInt(matches[1], 10) * 3600;
					} else {
						console.log(`“${value}”: did not understand duration part “${durationPart}” for entry `, entry);
						hasParsedDuration = false;
					}
				});

				if (hasParsedDuration) {
					hasDurationInS = true;
					durationInS = tmpDurationInS;
				}
			}
		});

		let shouldHide = (!isActivity && !isGroupActivity)
			|| (isEBikeRide && !hasPhotos)
			|| isVirtualRide
			|| (!hasMap && !isGroupActivity)
			|| (isRide && !hasPhotos && (!hasDistanceInKm || distanceInKm < 30) && (!hasElevationInM || elevationInM < 400))
			|| (isRun && !hasPhotos && (!hasDistanceInKm || distanceInKm < 20))
			|| (isHike && !hasPhotos && (!hasDistanceInKm || distanceInKm < 15))
			|| (isWalk && !hasPhotos && (!hasDistanceInKm || distanceInKm < 10))
			|| (isSwim && !hasPhotos && (!hasDurationInS || durationInS < 3600))
			|| (isWinterSport && !hasPhotos)
			|| (isOther && !hasPhotos && (!hasDurationInS || durationInS < 3600))
			|| (isCommute && !hasPhotos && (!hasDistanceInKm || distanceInKm < 30));

		if (shouldHide) {
			entry.classList.add('xxxJanStravaHidden');
		}
	}

	/* Process all existing feed entries. */
	Array.from(document.querySelectorAll('.feed-entry')).forEach(processEntry);

	/* Process feed entries that are dynamically loaded (when scrolling to the
	 * end of the feed or clicking the “Load more…” button).
	 */
	new MutationObserver(function (mutations) {
		mutations.forEach(function(mutation) {
			if (!mutation?.addedNodes?.length) {
				return;
			}

			Array.from(mutation.addedNodes)
				.forEach(node => {
					if (typeof node.matches === 'function' && node.matches('.feed-entry')) {
						processEntry(node);
					} else if (typeof node.querySelectorAll === 'function') {
						Array.from(node.querySelectorAll('.feed-entry')).forEach(processEntry);
					}
				});
		});
	}).observe(document, {
		childList: true,
		subtree: true
	});

	/* Hide unwanted stuff outside of the feed. */
	Array.from(document.querySelectorAll('.upsell')).forEach(
		element => element.classList.add('xxxJanStravaHidden')
	);

	/* Hide kudos notifications on <https://www.strava.com/notifications>. */
	Array.from(document.querySelectorAll('#notifications-list-view tr')).forEach(notification => {
		if (notification.textContent.trim().match(/\bkudos\b/i)) {
			notification.classList.add('xxxJanStravaHidden');
		}
	});
})();
