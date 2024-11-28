/**
 * Hide visual pollution from the Strava feed.
 *
 * “Pollution” is a highly subjective term, meaning “everything I do not care
 * enough about to want to see featured in the feed”. That means things like
 * very short rides (unless they have photos), short runs/hikes/walks, water
 * sports and winter sports, Zwift sessions, people joining clubs or
 * challenges, …
 *
 * On individual activity pages, hide segment efforts that are either too short
 * or not “climby” enough.
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

	/**
	 * Return the float of a string like `1.23 km`. The unit suffix is
	 * required for this function.
	 */
	function parseDistance(str) {
		const matches = str.match(/\b([0-9]+([.,][0-9]*))\s*km\s*$/);
		if (matches) {
			return parseFloat(matches[1].replace(',', '.'));
		}
	}

	/**
	 * Return the float of a string like `123 m`. The unit suffix is
	 * required for this function.
	 */
	function parseElevation(str) {
		const matches = str.match(/\b(-?([0-9]+,)*[0-9]+)\s*m\s*$/);
		if (matches) {
			return parseFloat(matches[1].replace(/,/g, ''));
		}
	}

	/**
	 * Return the float of a string like `12.3%`. The percentage sign is
	 * required for this function.
	 */
	function parseGradient(str) {
		const matches = str.match(/(?:^| )(-?[0-9]+([.,][0-9]+)?)s*%\s*$/);
		if (matches) {
			return parseFloat(matches[1].replace(',', '.'));
		}
		else console.log({str, matches});
	}

	const svgHashesToActivityTypes = {
		'11aee5c6a05c68': 'Ride',

		'7bff3f2fc88c': 'MountainBikeRide',

		'7a2bf999b4f3b': 'GravelRide',

		'931d5cb9192ef': 'EBikeRide',

		'1b2b11443451d8': 'Run',
		'f2bdf771a3337': 'TrailRun',
		'1eb790ca0d49e3': 'Hike',
		'f4f09ecc49e9d': 'Walk',

		'b75670032154d': 'Swim',

		'1ce1f590343417': 'IceSkate',
		'12a38b7f5edc98': 'BackcountrySki',
		/* '12a38b7f5edc98': 'AlpineSki', Same as `BackcountrySki` in Strava’s fall 2024 restyling. */

		'bff242f16fcb0': 'Wheelchair',

		'b34dc55e98b69': 'WeightTraining',

		'1877faad59afe8': 'Windsurf',
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
		/* Feed entry types. */
		const isActivity = !!entry.querySelector('[class*="ActivityEntry"]');
		const isGroupActivity = !!entry.querySelector('[class*="GroupActivity"]');
		const isClubJoin = !!(entry.querySelector('[class*="AthleteJoinEntry"]') && entry.querySelector('[class*="ClubJoin"]'));
		const isChallengeJoin = !!(entry.querySelector('[class*="AthleteJoinEntry"]') && entry.querySelector('[class*="ChallengeJoin"]'));
		const isPromo = !!entry.querySelector('[class*="PromoEntry"]');
		const isPost = !!entry.querySelector('a[href*="/posts/"]');

		const firstActivityFromGroup = isGroupActivity && entry.querySelector('[class*="GroupActivityEntry"]');

		/* Tags/special properties. */
		const isOwnActivity = !!entry.querySelector('[class*="Owner"]')?.querySelector(`a[href="${ownProfileHref}"]`);

		const isCommute = !!document.evaluate('.//*[@data-testid="tag"][contains(., "Commute") or contains(., "Woon-werkverkeer")]', entry, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		const isVirtual = !!document.evaluate('.//*[@data-testid="tag"][contains(., "Virtu")]', entry, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		const activityName = entry.querySelector('[data-testid="activity_name"]')?.textContent;

		/* Activity types, based on the activity icon’s SVG. (Super robust, yeah.) */
		const svgIcon = entry.querySelector('[class*="activityIcon"] path');
		const svgHash = svgIcon
			? calculateHash(svgIcon.outerHTML)
			: '';

		const activityType = svgHashesToActivityTypes[svgHash];

		/* Log unknown activity types so we can update our svgHashesToActivityTypes table. */
		if (isActivity) {
			const svg = svgIcon?.closest('svg');
			const svgTitle = (svg?.getAttribute('title') || svg?.querySelector('title')?.textContent)?.replace(/[ -]/g, '');

			if (typeof activityType === 'undefined') {
				if (typeof svgTitle === 'undefined') {
					console.warn(`⚠️  Activity “${activityName}”: Unknown activity type for SVG with checksum “${svgHash}” but without SVG title; svg: `, svg, '; entry: ', entry);
				} else {
					svgHashesToActivityTypes[svgHash] = svgTitle;
					console.info(`🆕 Activity “${activityName}”: Updated svgHashesToActivityTypes with checksum “${svgHash}” for title “${svgTitle}”`);
					console.log(`const svgHashesToActivityTypes = ${JSON.stringify(svgHashesToActivityTypes, null, '    ')};\n\n`, svgHashesToActivityTypes);
				}
			} else if (typeof svgTitle !== 'undefined' && svgHashesToActivityTypes[svgHash] !== svgTitle && !isVirtual) {
				console.error(`⚠️ ⚠️ ⚠️  Activity “${activityName}”: SVG CHECKSUM COLLISION?! “${svgHash}” already is “${svgHashesToActivityTypes[svgHash]}”, not “${svgTitle}”! ⚠️ ⚠️ ⚠️ ; svg: `, svg, '; entry: ', entry)
			}
		}

		const isRide = activityType === 'Ride';

		const isMountainBikeRide = activityType === 'MountainBikeRide';

		const isGravelRide = activityType === 'GravelRide';

		const isEBikeRide = activityType === 'EBikeRide';

		const isRun = activityType === 'Run';

		const isTrailRun = activityType === 'TrailRun';

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
			&& !isMountainBikeRide
			&& !isGravelRide
			&& !isVirtual
			&& !isEBikeRide
			&& !isRun
			&& !isTrailRun
			&& !isHike
			&& !isWalk
			&& !isSwim
			&& !isWaterSport
			&& !isWinterSport
			&& !isPost;

		/* Media. */
		const hasPhotos = !!entry.querySelector('[data-testid="photo"]');

		const hasMap = !!entry.querySelector('[data-testid="map"]');

		/* Kudos and comments. */
		const numKudos = parseInt((firstActivityFromGroup || entry).querySelector('[data-testid="kudos_count"]')?.textContent, 10);
		const hasKudos = numKudos > 0;

		const numComments = parseInt((firstActivityFromGroup || entry).querySelector('[data-testid="comments_count"]')?.textContent, 10);
		const hasComments = numComments > 0;

		/* Statistics. */
		let distanceInKm;
		let hasDistanceInKm = false;

		let elevationInM;
		let hasElevationInM = false;

		let durationInS;
		let hasDurationInS = false;

		const stats = [];

		(firstActivityFromGroup || entry).querySelectorAll('[class*="list-stats"] > li, [class*="listStats"] > li').forEach(statContainer => {
			const statLabelContainer = statContainer.querySelector('[class*="stat-label"], [class*="statLabel"]');
			const statValueContainer = statContainer.querySelector('[class*="stat-value"], [class*="statValue"]');

			if (statLabelContainer && statValueContainer) {
				stats.push({label: statLabelContainer.textContent, value: statValueContainer.textContent});
			}
		});

		stats.forEach(stat => {
			const label = stat.label;
			const value = stat.value;

			/* TODO: add support/conversion for backwards non-SI units <https://i.redd.it/o093x6j57dk41.jpg> */
			if (label.match(/^(distan|afstand|distância)/i)) {
				const parsedValue = parseDistance(value);
				if (Number.isFinite(parsedValue)) {
					hasDistanceInKm = true;
					distanceInKm = parsedValue;
				}
			} else if (label.match(/^(elev\S* gain|hoogteverschil|höhenmeter|desnivel|dislivello|ganho de elevação)/i)) {
				const parsedValue = parseElevation(value);
				if (Number.isFinite(parsedValue)) {
					hasElevationInM = true;
					elevationInM = parsedValue;
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

		if (!isActivity && !isGroupActivity && !isPost) {
			shouldHide = true;
			reasonForHiding = 'Not an activity or post';
		} else if (isEBikeRide && !hasPhotos) {
			shouldHide = true;
			reasonForHiding = 'E-bike ride without photos';
		} else if (isVirtual) {
			shouldHide = true;
			reasonForHiding = 'Virtual ride';
		} else if (!hasMap && !isGroupActivity && !isPost) {
			shouldHide = true;
			reasonForHiding = 'No map/GPS data (and not a group activity or post)';
		} else if (isRide && !hasPhotos && (!hasDistanceInKm || distanceInKm < 30) && (!hasElevationInM || elevationInM < 400)) {
			shouldHide = true;
			reasonForHiding = 'Short ride without photos and without noteworthy elevation gain';
		} else if (isMountainBikeRide && !hasPhotos && (!hasDistanceInKm || distanceInKm < 20) && (!hasElevationInM || elevationInM < 300)) {
			shouldHide = true;
			reasonForHiding = 'Short mountain bike ride without photos and without noteworthy elevation gain';
		} else if (isGravelRide && !hasPhotos && (!hasDistanceInKm || distanceInKm < 30) && (!hasElevationInM || elevationInM < 300)) {
			shouldHide = true;
			reasonForHiding = 'Short gravel ride without photos and without noteworthy elevation gain';
		} else if (isRun && !hasPhotos && (!hasDistanceInKm || distanceInKm < 20)) {
			shouldHide = true;
			reasonForHiding = 'Short run without photos';
		} else if (isTrailRun && !hasPhotos && (!hasDistanceInKm || distanceInKm < 10)) {
			shouldHide = true;
			reasonForHiding = 'Short trail run without photos';
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
			'Decision:',
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
			isPost
				? `isPost = ${isPost}`
				: null,

			'Tags/special properties:',
			`isOwnActivity = ${isOwnActivity}`,
			`isCommute = ${isCommute}`,
			`isVirtual = ${isVirtual}`,

			'Activity type:',
			isRide
				? `isRide = ${isRide}`
				: null,
			isMountainBikeRide
				? `isMountainBikeRide = ${isMountainBikeRide}`
				: null,
			isGravelRide
				? `isGravelRide = ${isGravelRide}`
				: null,
			isEBikeRide
				? `isEBikeRide = ${isEBikeRide}`
				: null,
			isRun
				? `isRun = ${isRun}`
				: null,
			isTrailRun
				? `isTrailRun = ${isTrailRun}`
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
			`hasPhotos = ${hasPhotos}`,
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
	const entrySelector = '[class*="FeedEntry"][class*="entryContainer"]';
	Array.from(document.querySelectorAll(entrySelector)).forEach(processEntry);

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
					if (typeof node.matches === 'function' && node.matches(entrySelector)) {
						processEntry(node);
					} else if (typeof node.querySelectorAll === 'function') {
						Array.from(node.querySelectorAll(entrySelector)).forEach(processEntry);
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

	/* Hide segments on individual activity pages that are either too short or
	* too flat. */
	document.querySelectorAll('tr[data-segment-effort-id]').forEach(tr => {
		const [distanceElement, elevationElement, averageGradientElement] = tr.querySelectorAll('.stats > span');
		const distanceInKm = parseDistance(distanceElement.textContent);
		const elevationInM = parseElevation(elevationElement.textContent);
		const gradientPercentage = parseGradient(averageGradientElement.textContent);

		/* Top 10 results are always interesting. */
		if (tr.querySelector('[class*="icon-at-kom-"]')) {
			tr.title = `shide: Not hiding, because a top 10 result: ${distanceInKm} km / ${elevationInM} m / ${gradientPercentage}%`;
			return;
		}

		/* Categorized climbs are always interesting. */
		if (tr.querySelector('td.climb-cat-col:not(:empty)')) {
			tr.title = `shide: Not hiding, because a categorized climb: ${distanceInKm} km / ${elevationInM} m / ${gradientPercentage}%`;
			return;
		}

		if (
			(distanceInKm >= 10)
			|| (distanceInKm >= 5 && gradientPercentage >= 2)
			|| (distanceInKm >= 0.75 && gradientPercentage >= 3)
			|| (distanceInKm >= 0.50 && gradientPercentage >= 6)
		) {
			tr.title = `shide: Not hiding because steep and/or long enough: ${distanceInKm} km / ${elevationInM} m / ${gradientPercentage}%`;
			return;
		}

		tr.title = `shide: Hiding because not interesting: ${distanceInKm} km / ${elevationInM} m / ${gradientPercentage}%`;
		tr.classList.add('xxxJanStravaHidden');

		/* To permanently hide the segment, click the button provided by Strava:
		 * tr.querySelector('[data-action="hide"]')?.click();
		 * But that causes a LOT of network requests, obviously. */
	});

	/* Hide segments on an athlete’s leaderboard page that are either too
	 * short or too flat. */
	document.querySelectorAll('.my-segments tbody tr').forEach(tr => {
		const distanceElement = tr.cells[3];
		const elevationElement = tr.cells[4];
		const distanceInKm = parseDistance(distanceElement.textContent);
		const elevationInM = parseElevation(elevationElement.textContent);
		const gradientPercentage = (elevationInM / (distanceInKm * 10)).toFixed(1);

		if (
			(distanceInKm >= 10)
			|| (distanceInKm >= 5 && gradientPercentage >= 2)
			|| (distanceInKm >= 0.75 && gradientPercentage >= 3)
			|| (distanceInKm >= 0.50 && gradientPercentage >= 6)
		) {
			tr.title = `shide: Not hiding because steep and/or long enough: ${distanceInKm} km / ${elevationInM} m / ${gradientPercentage}%`;
			return;
		}

		tr.title = `shide: Hiding because not interesting: ${distanceInKm} km / ${elevationInM} m / ${gradientPercentage}%`;
		tr.classList.add('xxxJanStravaHidden');
	});

	/* Get rid of useless `title` attributes. They hide the tooltips from
	 * their ancestor elements’ `title` attributes, which are more useful
	 * (because I added them). */
	document.querySelectorAll('button[title], abbr.unit[title], div[data-testid="achievement_container"]').forEach(element =>
		element.removeAttribute('title')
	);

	document.querySelectorAll('a[title]').forEach(a => {
		if (a.title.trim() === a.textContent.trim()) {
			a.removeAttribute('title');
		}
	});
})();
