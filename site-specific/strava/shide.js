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
		/* Get the JSON-encoded data for the entry. */
		const jsonContainer = entry.querySelector('[data-react-props]');
		if (!jsonContainer) {
			console.log('shide: no JSON container found for entry ', entry);
			return;
		}

		const json = jsonContainer.dataset.reactProps;
		if (typeof json === 'undefined' || (json + '').trim() === '') {
			console.log('shide: no JSON in container ', jsonContainer, ' for entry ', entry);
			return;
		}

		const data = JSON.parse(json);
		if (!data) {
			console.log('shide: could not parse JSON “', json, + '” from container ', jsonContainer, ' for entry ', entry);
			return;
		}

		/* Feed entry types. */
		const isActivity = data.entity === 'Activity';
		const isGroupActivity = data.entity === 'GroupActivity';
		const isClub = data.entity === 'Club';
		const isChallenge = data.entity === 'Challenge';
		const isPromo = data.entity === 'FancyPromo';

		/* Tags/special properties. */
		const isOwnActivity = data.activity?.ownedByCurrentAthlete
			|| data.rowData?.activities?.[0]?.owned_by_current_athlete
			|| false;

		const isCommute = data.activity?.isCommute
			|| data.rowData?.activities?.[0]?.is_commute
			|| false;

		const isVirtualRide = data.activity?.isVirtualRide
			|| data.rowData?.activities?.[0]?.is_virtual
			|| false;

		/* Activity types, taken from the JSON data and completed with
		 * <https://github.com/strava/go.strava/blob/master/activities_test.go>.
		 */
		const isRide = data.activity?.type === 'Ride'
			|| data.rowData?.activities?.[0]?.type === 'Ride';

		const isEBikeRide = data.activity?.type === 'EBikeRide'
			|| data.rowData?.activities?.[0]?.type === 'EBikeRide';

		const isRun = data.activity?.type === 'Run'
			|| data.rowData?.activities?.[0]?.type === 'Run';

		const isHike = data.activity?.type === 'Hike'
			|| data.rowData?.activities?.[0]?.type === 'Hike';

		const isWalk = data.activity?.type === 'Walk'
			|| data.rowData?.activities?.[0]?.type === 'Walk';

		const isSwim = data.activity?.type === 'Swim'
			|| data.rowData?.activities?.[0]?.type === 'Swim';

		const isWaterSport = data.activity?.type === 'WaterSport'
			|| data.rowData?.activities?.[0]?.type === 'WaterSport'
			|| data.activity?.type === 'Surfing'
			|| data.rowData?.activities?.[0]?.type === 'Surfing'
			|| data.activity?.type === 'Kitesurf'
			|| data.rowData?.activities?.[0]?.type === 'Kitesurf'
			|| data.activity?.type === 'Windsurf'
			|| data.rowData?.activities?.[0]?.type === 'Windsurf'
			|| data.activity?.type === 'Canoeing'
			|| data.rowData?.activities?.[0]?.type === 'Canoeing'
			|| data.activity?.type === 'Kayaking'
			|| data.rowData?.activities?.[0]?.type === 'Kayaking'
			|| data.activity?.type === 'Rowing'
			|| data.rowData?.activities?.[0]?.type === 'Rowing'
			|| data.activity?.type === 'StandUpPaddling'
			|| data.rowData?.activities?.[0]?.type === 'StandUpPaddling';

		const isWinterSport = data.activity?.type === 'WinterSport'
			|| data.rowData?.activities?.[0]?.type === 'WinterSport'
			|| data.activity?.type === 'AlpineSki'
			|| data.rowData?.activities?.[0]?.type === 'AlpineSki'
			|| data.activity?.type === 'BackcountrySki'
			|| data.rowData?.activities?.[0]?.type === 'BackcountrySki'
			|| data.activity?.type === 'NordicSki'
			|| data.rowData?.activities?.[0]?.type === 'NordicSki'
			|| data.activity?.type === 'RollerSki' /* Hm, not exactly “winter”, but hey… */
			|| data.rowData?.activities?.[0]?.type === 'RollerSki'
			|| data.activity?.type === 'CrossCountrySkiing'
			|| data.rowData?.activities?.[0]?.type === 'CrossCountrySkiing'
			|| data.activity?.type === 'Snowboard'
			|| data.rowData?.activities?.[0]?.type === 'Snowboard'
			|| data.activity?.type === 'Snowshoe'
			|| data.rowData?.activities?.[0]?.type === 'Snowshoe'
			|| data.activity?.type === 'IceSkate'
			|| data.rowData?.activities?.[0]?.type === 'IceSkate';

		/* Pretty much equal to: Workout || Crossfit || Elliptical || RockClimbing || StairStepper || WeightTraining || Yoga */
		const isOther = !isCommute
			&& !isRide
			&& !isVirtualRide
			&& !isEBikeRide
			&& !isRun
			&& !isHike
			&& !isWalk
			&& !isSwim
			&& !isWaterSport
			&& !isWinterSport;

		/* Media. */
		const numPhotos = data.activity?.mapAndPhotos?.photoList?.length
			|| data.rowData?.activities?.[0]?.photos?.length
			|| 0;

		const hasPhotos = numPhotos > 0;

		const hasMap = !!(
			data.activity?.mapAndPhotos?.activityMap
			|| data.rowData?.activities?.[0]?.activity_map?.url
		);

		/* Kudos and comments. */
		const numKudos = data.activity?.kudosAndComments?.kudosCount
			|| 0;
		const hasKudos = numKudos > 0;

		const numComments = data.activity?.kudosAndComments?.comments?.length
			|| 0;

		const hasComments = numComments > 0;

		/* Statistics. */
		let distanceInKm = undefined;
		let hasDistanceInKm = false;

		let elevationInM = undefined;
		let hasElevationInM = false;

		let durationInS = undefined;
		let hasDurationInS = false;

		const stats = data.activity?.stats
			|| data.rowData?.activities?.[0]?.stats;

		const parsedStats = {};

		if (Array.isArray(stats)) {
			stats.forEach(stat => {
				const isSubTitle = stat.key.match(/_subtitle$/);

				const key = isSubTitle
					? stat.key.replace(/_subtitle$/, '')
					: stat.key;

				if (!parsedStats[key]) {
					parsedStats[key] = {};
				}

				if (isSubTitle) {
					parsedStats[key].label = stat.value;
				} else {
					parsedStats[key].value = stat.value.replace(/<[^>]+>/g, '');
				}
			});
		}

		Object.values(parsedStats).forEach(stat => {
			const label = stat.label;
			const value = stat.value;

			/* TODO: add support/conversion for backwards non-SI units <https://i.redd.it/o093x6j57dk41.jpg> */
			if (label.match(/^(distan|afstand|distância)/i)) {
				let matches = value.match(/\b([0-9]+([.,][0-9]*))\s*km\s*$/);
				if (matches) {
					hasDistanceInKm = true;
					distanceInKm = parseFloat(matches[1].replace(',', '.'));
				}
			} else if (label.match(/^(elev\S* gain|hoogteverschil|höhenmeter|desnivel|dislivello|ganho de elevação)/i)) {
				let matches = value.match(/\b([0-9]+)\s*m\s*$/);
				if (matches) {
					hasElevationInM = true;
					elevationInM = parseFloat(matches[1]);
				}
			} else if (label.match(/^(time|tijd|zeit|tiempo|tempo)/i)) {
				let tmpDurationInS = 0;
				let hasParsedDuration = true;

				value.split(/\s([0-9]+\s*[^0-9]+)\s*/).forEach(durationPart => {
					let matches;
					if (durationPart.trim() === '') {
					} else if ((matches = durationPart.match(/^\s*([0-9]+)s/))) {
						tmpDurationInS += parseInt(matches[1], 10);
					} else if ((matches = durationPart.match(/^\s*([0-9]+)m/))) {
						tmpDurationInS += parseInt(matches[1], 10) * 60;
					} else if ((matches = durationPart.match(/^\s*([0-9]+)[hu]/))) {
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

		/* Decide whether or not to hide the entry. */
		let shouldHide = false;
		let reasonForHiding = null;

		if (!isActivity && !isGroupActivity) {
			shouldHide = true;
			reasonForHiding = 'Not an activity';
		} else if (isEBikeRide && !hasPhotos) {
			shouldHide = true;
			reasonForHiding = 'E-bike ride without photos';
		} else if (isVirtualRide) {
			shouldHide = true;
			reasonForHiding = 'Virtual ride';
		} else if (!hasMap && !isGroupActivity) {
			shouldHide = true;
			reasonForHiding = 'No map/GPS data (and not a group activity)';
		} else if (isRide && !hasPhotos && (!hasDistanceInKm || distanceInKm < 30) && (!hasElevationInM || elevationInM < 400)) {
			shouldHide = true;
			reasonForHiding = 'Short ride without photos and without noteworthy elevation gain';
		} else if (isRun && !hasPhotos && (!hasDistanceInKm || distanceInKm < 20)) {
			shouldHide = true;
			reasonForHiding = 'Short run without photos';
		} else if (isHike && !hasPhotos && (!hasDistanceInKm || distanceInKm < 15)) {
			shouldHide = true;
			reasonForHiding = 'Short hike without photos';
		} else if (isWalk && !hasPhotos && (!hasDistanceInKm || distanceInKm < 10)) {
			shouldHide = true;
			reasonForHiding = 'Short walk without photos';
		} else if (isSwim && !hasPhotos && (!hasDurationInS || durationInS < 3600)) {
			shouldHide = true;
			reasonForHiding = 'Short swim without photos';
		} else if (isWinterSport && !hasPhotos) {
			shouldHide = true;
			reasonForHiding = 'Winter sports without photos';
		} else if (isOther && !hasPhotos && (!hasDurationInS || durationInS < 3600)) {
			shouldHide = true;
			reasonForHiding = 'Other short activity without photos';
		} else if (isCommute && !hasPhotos && (!hasDistanceInKm || distanceInKm < 30)) {
			shouldHide = true;
			reasonForHiding = 'Short commute without photos';
		}

		if (shouldHide) {
			entry.classList.add('xxxJanStravaHidden');
		}

		/* Show the parsed information we use to decide the fate of the entry. */
		entry.title = [
			'/* Decision. */',
			`shouldHide = ${shouldHide}`,
			`reasonForHiding = ${reasonForHiding}`,

			'/* Feed entry types. */',
			`isActivity = ${isActivity}`,
			`isGroupActivity = ${isGroupActivity}`,
			`isClub = ${isClub}`,
			`isChallenge = ${isChallenge}`,
			`isPromo = ${isPromo}`,

			'/* Tags/special properties. */',
			`isOwnActivity = ${isOwnActivity}`,
			`isCommute = ${isCommute}`,
			`isVirtualRide = ${isVirtualRide}`,

			'/* Activity types. */',
			`isRide = ${isRide}`,
			`isEBikeRide = ${isEBikeRide}`,
			`isRun = ${isRun}`,
			`isHike = ${isHike}`,
			`isWalk = ${isWalk}`,
			`isSwim = ${isSwim}`,
			`isWaterSport = ${isWaterSport}`,
			`isWinterSport = ${isWinterSport}`,
			`isOther = ${isOther}`,

			'/* Media. */',
			`numPhotos = ${numPhotos}`,
			`hasPhotos = ${hasPhotos}`,
			`hasMap = ${hasMap}`,

			'/* Kudos and comments. */',
			`numKudos = ${numKudos}`,
			`hasKudos = ${hasKudos}`,
			`numComments = ${numComments}`,
			`hasComments = ${hasComments}`,

			'/* Statistics. */',
			`distanceInKm = ${distanceInKm}`,
			`hasDistanceInKm = ${hasDistanceInKm}`,
			`elevationInM = ${elevationInM}`,
			`hasElevationInM = ${hasElevationInM}`,
			`durationInS = ${durationInS}`,
			`hasDurationInS = ${hasDurationInS}`,

			`${entry.title ? '\n\n======\n\n' + entry.title : ''}`
		].join('\n').replace(/^(\/\*)/gm, '\n$1').trim();
	}

	/* Process all existing feed entries. */
	Array.from(document.querySelectorAll('.feed .react-card-container')).forEach(processEntry);

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
					if (typeof node.matches === 'function' && node.matches('.react-card-container')) {
						processEntry(node);
					} else if (typeof node.querySelectorAll === 'function') {
						Array.from(node.querySelectorAll('.react-card-container')).forEach(processEntry);
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
