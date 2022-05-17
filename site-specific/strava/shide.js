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
	/* ↓ The following `cyrb53` function is used for hashing the SVG activity
	 * ↓ icons in order to determine the activity type. I don’t care about
	 * ↓ cryptographic properties all that, so I have not checked the source.
	 * ↓ It may well be perfect, but all I care about is that it is Good Enough™
	 * ↓ for my purposes. */
	/**
	 * cyrb53 (c) 2018 bryc (github.com/bryc)
	 * A fast and simple hash function with decent collision resistance.
	 * Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
	 * Public domain. Attribution appreciated.
	 */
	const cyrb53 = function(str, seed = 0) {
		let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
		for (let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
		h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
		return 4294967296 * (2097151 & h2) + (h1>>>0);
	};

	function calculateHash(str) {
		return cyrb53(str).toString(16);
	}

	const svgHashesToActivityTypes = {
		'16edea6887d196': 'Ride',
		'16f788ac0ed6d3': 'EBikeRide',

		'f801835ea53ad': 'Run',
		'153fcbcc5018c3': 'Hike',
		'1986a6bb534033': 'Walk',

		'cbf4e2c84d04c': 'Swim',

		'11af222ad81529': 'IceSkate',
		'9c7194036d140': 'BackcountrySki',

		'bff242f16fcb0': 'Wheelchair',
	};

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

		/* Limit the number of visible clubs (for those wankers [m/f/x] that join every single Strava club they come across). */
		.grid.clubs {
			max-height: 50vh;
			overflow: scroll;
		}
	`;

	document.head.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'style')).textContent = css;

	/* Determine the profile URL for the logged-in user. This will be used to
	 * see which activities are the current user’s own. */
	const ownProfileLink = Array.from(document.querySelectorAll('.user-nav a[href^="/athletes/"]'))
		.filter(a => a.getAttribute('href').match(/^\/athletes\/[^\/]+\/?$/))[0];

	const ownProfileHref = ownProfileLink?.getAttribute('href');
	const ownProfileUrl = ownProfileLink?.href;

	/**
	 * Process a feed entry.
	 */
	function processEntry(entry) {
/* XXX DELME XXX */ const data = {};
		/* Feed entry types. */
		const isActivity = !!entry.querySelector('[class^="ActivityEntry"]');
		const isGroupActivity = !!entry.querySelector('[class^="GroupActivity"]');
		const isClubJoin = !!(entry.querySelector('[class^="AthleteJoinEntry"]') && entry.querySelector('[class*="ClubJoin"]'));
		const isChallengeJoin = !!(entry.querySelector('[class^="AthleteJoinEntry"]') && entry.querySelector('[class*="ChallengeJoin"]'));
		const isPromo = !!entry.querySelector('[class^="PromoEntry"]');

		/* Tags/special properties. */
		const isOwnActivity = !!entry.querySelector('[class*="Owner"]')?.querySelector(`a[href="${ownProfileHref}"]`);

		const isCommute = !!document.evaluate('.//*[@data-testid="tag"][contains(., "Commute")]', entry, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		const isVirtual = !!document.evaluate('.//*[@data-testid="tag"][contains(., "Virtual")]', entry, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		/* Activity types, based on the activity icon’s SVG. (Super robust, yeah.) */
		const svgIcon = entry.querySelector('[class*="activity-icon"] path');
		const svgHash = svgIcon
			? calculateHash(svgIcon.outerHTML)
			: '';

		const activityType = svgHashesToActivityTypes[svgHash];

		/* Log unknown activity types so we can update our svgHashesToActivityTypes table. */
		if (isActivity) {
			const svg = svgIcon?.closest('svg');
			const svgTitle = svg?.getAttribute('title')?.replace(/[ -]/g, '');

			if (typeof activityType === 'undefined') {
				if (typeof svgTitle === 'undefined') {
					console.warn(`⚠️  Unknown activity type for SVG with checksum “${svgHash}” but without SVG title; svg: `, svg, '; entry: ', entry);
				} else {
					svgHashesToActivityTypes[svgHash] = svgTitle;
					console.info(`🆕 Updated svgHashesToActivityTypes with checksum “${svgHash}” for title “${svgTitle}”`);
					console.log(`const svgHashesToActivityTypes = ${JSON.stringify(svgHashesToActivityTypes)};\n\n`, svgHashesToActivityTypes);
				}
			} else if (typeof svgTitle !== 'undefined' && svgHashesToActivityTypes[svgHash] !== svgTitle && !isVirtual) {
				console.error(`⚠️ ⚠️ ⚠️  SVG CHECKSUM COLLISION?! “${svgHash}” already is “${svgHashesToActivityTypes[svgHash]}”, not “${svgTitle}”! ⚠️ ⚠️ ⚠️ ; svg: `, svg, '; entry: ', entry)
			}
			window.svgHashesToActivityTypes = svgHashesToActivityTypes;
			console.log({entry, svgIcon, svgHash, svg, svgTitle, type: svgHashesToActivityTypes[svgHash]});
		}

		const isRide = activityType === 'Ride';

		const isEBikeRide = activityType === 'EBikeRide';

		const isRun = activityType === 'Run';

		const isHike = activityType === 'Hike';

		const isWalk = activityType === 'Walk';

		const isSwim = activityType === 'Swim';

		const isWaterSport = activityType === 'WaterSport'
			|| activityType === 'Surfing'
			|| activityType === 'Kitesurf'
			|| activityType === 'Windsurf'
			|| activityType === 'Canoeing'
			|| activityType === 'Kayaking'
			|| activityType === 'Rowing'
			|| activityType === 'StandUpPaddling';

		const isWinterSport = activityType === 'WinterSport'
			|| activityType === 'AlpineSki'
			|| activityType === 'BackcountrySki'
			|| activityType === 'NordicSki'
			|| activityType === 'RollerSki' /* Hm, not exactly “winter”, but hey… */
			|| activityType === 'CrossCountrySkiing'
			|| activityType === 'Snowboard'
			|| activityType === 'Snowshoe'
			|| activityType === 'IceSkate';

		/* Pretty much equal to: Workout || Crossfit || Elliptical || RockClimbing || StairStepper || WeightTraining || Yoga */
		const isOther = !isCommute
			&& !isRide
			&& !isVirtual
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
				let matches = value.match(/\b(([0-9]+,)*[0-9]+)\s*m\s*$/);
				if (matches) {
					hasElevationInM = true;
					elevationInM = parseFloat(matches[1].replace(/,/g, ''));
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
		} else if (isVirtual) {
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
/* XXX → DELME → XXX */ if (0)
			entry.classList.add('xxxJanStravaHidden');
		}

		/* Show the parsed information we use to decide the fate of the entry. */
		entry.title = [
			'Decision:',
			`ownProfileHref: ${ownProfileHref}`,
			`ownProfileUrl: ${ownProfileUrl}`,
			`shouldHide = ${shouldHide}`,
			reasonForHiding
				? `reasonForHiding = ${reasonForHiding}`
				: null,

			'Feed entry types:',
			`isActivity = ${isActivity}`,
			`isGroupActivity = ${isGroupActivity}`,
			isClubJoin
				? `isClubJoin = ${isClubJoin}`
				: null,
			isChallengeJoin
				? `isChallengeJoin = ${isChallengeJoin}`
				: null,
			isPromo
				? `isPromo = ${isPromo}`
				: null,

			'Tags/special properties:',
			`isOwnActivity = ${isOwnActivity}`,
			`isCommute = ${isCommute}`,
			`isVirtual = ${isVirtual}`,

			'Activity type:',
			isRide
				? `isRide = ${isRide}`
				: null,
			isEBikeRide
				? `isEBikeRide = ${isEBikeRide}`
				: null,
			isRun
				? `isRun = ${isRun}`
				: null,
			isHike
				? `isHike = ${isHike}`
				: null,
			isWalk
				? `isWalk = ${isWalk}`
				: null,
			isSwim
				? `isSwim = ${isSwim}`
				: null,
			isWaterSport
				? `isWaterSport = ${isWaterSport}`
				: null,
			isWinterSport
				? `isWinterSport = ${isWinterSport}`
				: null,
			isOther
				? `isOther = ${isOther}`
				: null,

			'Media:',
			hasPhotos
				? `numPhotos = ${numPhotos}`
				: `hasPhotos = ${hasPhotos}`,
			`hasMap = ${hasMap}`,

			'Kudos and comments:',
			hasKudos
				? `numKudos = ${numKudos}`
				: `hasKudos = ${hasKudos}`,
			hasComments
				? `numComments = ${numComments}`
				: `hasComments = ${hasComments}`,

			'Statistics:',
			hasDistanceInKm
				? `distanceInKm = ${distanceInKm}`
				: `hasDistanceInKm = ${hasDistanceInKm}`,
			hasElevationInM
				? `elevationInM = ${elevationInM}`
				: null,
			hasDurationInS
				? `durationInS = ${durationInS}`
				: null,
			hasDistanceInKm && hasDurationInS
				? `calculatedAverageSpeed = ${(distanceInKm / durationInS * 3600).toFixed(1)} km/h`
				: null,

			`${entry.title ? '\n\n======\n\n' + entry.title : ''}`
		].filter(_ => _).join('\n').replace(/^([A-Z])/gm, '\n$1').trim();
	}

	/* Process all existing feed entries. */
	Array.from(document.querySelectorAll('[class*="Feed--entry-container"]')).forEach(processEntry);

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
					if (typeof node.matches === 'function' && node.matches('[class*="Feed--entry-container"]')) {
						processEntry(node);
					} else if (typeof node.querySelectorAll === 'function') {
						Array.from(node.querySelectorAll('[class*="Feed--entry-container"]')).forEach(processEntry);
					}
				});
		});
	}).observe(document, {
		childList: true,
		subtree: true
	});

	/* Hide unwanted stuff outside of the feed. */
	Array.from(document.querySelectorAll('.upsell, [id*="upsell"]')).forEach(
		element => element.classList.add('xxxJanStravaHidden')
	);

	/* Hide kudos notifications on <https://www.strava.com/notifications>. */
	Array.from(document.querySelectorAll('#notifications-list-view tr')).forEach(notification => {
		if (notification.textContent.trim().match(/\bkudos\b/i)) {
			notification.classList.add('xxxJanStravaHidden');
		}
	});
})();
