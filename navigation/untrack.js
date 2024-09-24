/**
 * Remove analytics and tracking parameters such as Google Analytics’ “utm_*”
 * and Facebook’s “fbclid” from the current document location (URI/URL) and
 * from the links on the page. It does not reload the page or its frames.
 *
 * @title Untrack links
 */
(function untrack() {
	'use strict';

	/* The following list was based on
	* <https://en.wikipedia.org/wiki/UTM_parameters#See_also> and has since been
	* expanded, primarily with the code from https://privacytests.org/
	* <https://github.com/arthuredelstein/privacytests.org/blob/master/testing/index.js>.
	* */
	const parameterPatterns = [
		/* Google (Analytics, Ads, DoubleClick) */
		'utm_[^=]*',
		'gclid',
		'gclsrc',
		'dclid',
		'_ga',
		'_gl',
		'gad_source',
		'gbraid',
		'wbraid',

		 /* Facebook */
		'fbclid',
		'__cft__((%5B|\\[)[^=]*)?',
		'__tn__',
		'__eep__',

		 /* Instagram */
		'igsh',
		'igshid',
		'ig_rid',

		/* Twitter */
		'twclid',

		/* Microsoft/Bing */
		'msclkid',

		 /* Mailchimp */
		'mc_eid',

		 /* HubSpot */
		'__hsfp',
		'__hssc',
		'__hstc',
		'_hsenc',
		'hsCtaTracking',

		 /* Drip.com */
		'__s',

		/* Adobe Marketo */
		'mkt_tok',

		/* MailerLite */
		'ml_subscriber',
		'ml_subscriber_hash',

		/* Omeda */
		'oly_anon_id',
		'oly_enc_id',

		/* Omnisend */
		'omnisendContactID',

		/* Outbrain */
		'obOrigUrl',
		'outbrainclickid',

		/* Matomo (formerly Piwik).
		 * See https://matomo.org/faq/how-to/faq_120/ and
		 * https://help.piwik.pro/support/collecting-data/piwik-pro-url-builder/ */
		'matomo_campaign',
		'mtm_campaign',
		'mtm_cid',
		'mtm_content',
		'mtm_group',
		'mtm_keyword',
		'mtm_kwd',
		'mtm_medium',
		'mtm_placement',
		'mtm_source',
		'piwik_campaign',
		'piwik_kwd',
		'pk_campaign',
		'pk_cid',
		'pk_content',
		'pk_cpn',
		'pk_keyword',
		'pk_kwd',
		'pk_medium',
		'pk_source',

		/* Cloudflare DDOS challenge tokens */
		'__cf_chl_jschl_tk__',
		'__cf_chl_captcha_tk__',

		/* Unknown Russian tracker */
		'rb_clickid',

		/* Adobe Site Catalyst */
		's_cid',
		'ss_[^=]*',

		/* Vero */
		'vero_conv',
		'vero_id',

		/* Wicked Reports */
		'wickedid',

		/* Yandex */
		'yclid',
		'ymclid',
		'_openstat',

		/* Zanox/Awin */
		'zanpid'
	];

	const hrefRegexp = new RegExp('[?&](' + parameterPatterns.join('|') + ')=');
	const parameterRegexp = new RegExp('^(' + parameterPatterns.join('|') + ')$');

	/* Some URIs work just fine without parameters, and the parameters they
	 * use, seem to be mostly tracking-related anyway. Just delete them all.
	 */
	const uriPatternsForWhichToDeleteAllParameters = [
		/* New York Times articles */
		/* E.g. https://www.nytimes.com/2021/12/17/realestate/right-at-home-kitchen-reno.html?action=click&algo=bandit-all-surfaces-alpha-06&block=editors_picks_recirc&fellback=false&imp_id=000000000&impression_id=0abc123d-0000-0000-0000-000000000000&index=0&pgtype=Article&pool=pool%2F00000000-0000-0000-0000-000000000000&region=footer&req_id=000000000&surface=eos-home-featured&variant=0_bandit-all-surfaces-alpha-06 */
		/https?:\/\/(www\.)?nytimes\.com\/[^?]*\.html/,

		/* TikTok videos */
		/* E.g. https://www.tiktok.com/@andreswilley/video/7039611724638604549?_d=a0000000000000BcD000SdffsddfF0&checksum=0000000000000000000000000000000000000000000000000000000000000000&language=en&preview_pb=0&sec_user_id=Abcd12345DsdfdsfsdfsdfSDFS&share_app_id=1233&share_item_id=0000000000000000000&share_link_id=00000000-0000-0000-0000-000000000000&source=h5_m&timestamp=2147483648&tt_from=more&u_code=abcdef12345678&user_id=abcdef12345678efabc&_r=1&is_copy_url=1&is_from_webapp=v1 */
		/https?:\/\/(www\.)?tiktok\.com\/[^?]*\/video\/\d+/,

		/* Embedded Twitter profiles and tweets */
		/* E.g. https://twitter.com/Twitter/status/1509951255388504066?ref_src=twsrc%5Etfw */
		/https?:\/\/(www\.)?(twitter|x)\.com\/.*/,
	];

	const hrefRegexpForWhichToDeleteAllParameters = new RegExp('(?:'
		+ uriPatternsForWhichToDeleteAllParameters
			.map(regexp => regexp.toString().replace(/^\/(.*)\/[^\/]*$/, '$1'))
			.join('|')
		+ ')\\?');

	/* Link redirectors in the form 'CSS selector': handlerFunction(element). */
	const linkRedirectors = {
		/* Facebook */
		'a[href^="https://l.facebook.com/l.php?"], a[href^="https://lm.facebook.com/l.php?"]': a => {
			/* Facebook’s `l.php` takes the original URI in the `u` query string parameter. We do not care about the checksum or other parameters. */
			a.href = new URLSearchParams(new URL(a.href).search)?.get('u') ?? a.href;
		},

		/* Instagram */
		'a[href^="https://l.instagram.com/?"]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('u') ?? a.href;
		},

		/* Google */
		'a[href^="https://www.google."][href*="/url?"], a[href^="http://www.google."][href*="/url?"], a[href^="/url?"]': a => {
			/* Make sure we only process Google’s redirects. It seems the
			 * localised sites (e.g. www.google.de) do not use the `/url?`
			 * redirect, so checking if `a.hostname === 'www.google.com'`
			 * should suffise. However, the following regexp check is a good
			 * compromise between allowing only the `.com` and incorporating
			 * the entire Public Suffix List to check for valid top-level
			 * Google domains. */
			if (a.getAttribute('href').indexOf('/url?') === 0 && !a.hostname.match(/^www\.google\.(com?\.)?[^.]+$/)) {
				return;
			}

			const usp = new URLSearchParams(new URL(a.href).search);
			/* Sometimes the parameters is `url`, other times `q`. Heh. */
			a.href = usp.get('url') ?? usp.get('q') ?? a.href;
		},

		/* Google Translate */
		'a[href^="https://translate.google."][href*="/website?"][href*="u="]': a => {
			const usp = new URLSearchParams(new URL(a.href).search);
			a.href = usp.get('u') ?? a.href;
		},

		/* YouTube */
		'a[href^="https://www.youtube.com/redirect?"][href*="q="]': a => {
			let targetUri = new URLSearchParams(new URL(a.href).search)?.get('q');
			if (!targetUri) {
				return;
			}

			/* Sometimes the `q=` URIs do not specify the protocol, e.g.
			 * `www.example.com`. In that case, assume they are HTTPS. */
			if (!targetUri.match(/^[^\/]+:/)) {
				targetUri = `https://${targetUri}`;
			}

			a.href = targetUri;
		},

		/* Use Invidious (“an alternative front-end to YouTube”) instead of
		 * the original YouTube for videos. This is not technically a
		 * redirector, but I need to restructure this bookmarklet anyway. */
		'a[href^="https://www.youtube.com/watch?"][href*="v="]': a => {
			const url = new URL(a.href);
			const usp = new URLSearchParams(url.search);
			let videoId = usp?.get('v');
			if (!videoId) {
				return;
			}

			const newUsp = new URLSearchParams();
			usp.forEach((value, key) => {
				if (key === 'v' || key === 't') {
					newUsp.set(key, value);
				}
			});

			url.host = 'invidious.privacyredirect.com';
			url.search = newUsp.toString();

			a.href = url;
		},

		/* Twitter */
		'a[href^="https://t.co/"], a[href^="http://t.co/"]': a => {
			/* See if we are able to extract a URI from the link text. For
			 * text links without previews, the original URI is somewhat
			 * hidden inside a few SPANs and a text node, which are shown
			 * as a tooltip on hover. */
			let possibleUri = a.textContent;

			/* The site link in a user’s profile does not contain the full
			 * URI as its text. However, if there are no ellipses, we can
			 * safely ass-u-me the URI is shown as-is, albeit without its
			 * scheme. */
			if (a.dataset.testid === 'UserUrl' && possibleUri.indexOf('…') === -1) {
				if (possibleUri.indexOf('/') === -1) {
					possibleUri += '/';
				}

				if (!possibleUri.match(/^https?:\/\//)) {
					possibleUri = `${a.protocol}//${possibleUri}`;
				}
			}

			possibleUri = possibleUri.replace(/(^…|…$)/g, '');

			if (!possibleUri.match(/^https?:\/\//)) {
				return;
			}

			a.href = a.textContent = possibleUri;
		},

		/* LinkedIn */
		'a[href^="https://www.linkedin.com/redir/redirect?"]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('url') ?? a.href;
		},

		'a[href^="https://www.linkedin.com/signup/cold-join?"][href*="session_redirect="]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('session_redirect') ?? a.href;
		},

		/* Beehiiv (newsletter platform) */
		'a[href^="https://flight.beehiiv.net/v2/clicks/eyJ"]': a => {
			const parts = a.pathname.split('.');
			try {
				const originalUrl = JSON.parse(atob(parts[1].replaceAll('_', '/').replaceAll('-', '+'))).url;
				if (originalUrl) {
					a.href = originalUrl;
				}
			} catch (e) {
				console.log('untrack: error while decoding URL for link: ', a, e);
			}
		},

		/* Branch’s app.link redirector <https://www.branch.io/applink/>
		 * E.g. <https://strava-embeds.com/activity/8802726676> points to
		 * <https://strava.app.link/cLiaUa83sqb?%24fallback_url=https%3A%2F%2Fstrava.com%2Factivities%2F8802726676%2Foverview%3Futm_medium%3Dstrava%26utm_source%3Dactivity_embed&strava_deeplink_url=strava%3A%2F%2Factivities%2F8802726676>
		 * which should be rewritten to
		 * <https://www.strava.com/activities/8802726676/overview>
		 * */
		'a[href*="app.link"][href*="fallback_url"]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('$fallback_url') ?? a.href;
		},

		/* Reddit
		 * E.g. <https://www.reuters.com/legal/elon-musk-seeks-end-258-billion-dogecoin-lawsuit-2023-04-01/>
		 * gets rewritten (onclick etc.) to
		 * <https://out.reddit.com/t3_XXX?url=https%3A%2F%2Fwww.reuters.com%2Flegal%2Felon-musk-seeks-end-258-billion-dogecoin-lawsuit-2023-04-01%2F&token=XXXX&app_name=web2x&web_redirect=true>
		 */
		'a[href^="https://out.reddit.com/"][href*="url="]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('url') ?? a.href;
		},

		/* Feature.fm (music marketing platform)
		 * E.g. https://autechre.ffm.to/plus.owe
		 * */
		'a[href^="https://api.ffm.to/sl/e/c/"][href*="cd="]': a => {
			try {
				const originalUrl = JSON.parse(atob(new URL(a.href).searchParams.get('cd').replaceAll('_', '/').replaceAll('-', '+'))).destUrl;
				if (originalUrl) {
					if (a.textContent.trim() === a.href) {
						a.textContent = originalUrl;
					}

					a.href = originalUrl;
				}
			} catch (e) {
				console.log('untrack: error while decoding URL for link: ', a, e);
			}
		},

		/* Proofpoint URL Defense
		 * E.g. https://time.com/6161239/return-to-office-white-men/
		 * */
		'a[href^="https://urldefense.proofpoint.com/v2/url?"][href*="u="]': a => {
			try {
				const originalUrl = decodeURIComponent(new URL(a.href).searchParams.get('u').replaceAll('_', '/').replaceAll('-', '%'));
				if (originalUrl) {
					if (a.textContent.trim() === a.href) {
						a.textContent = originalUrl;
					}

					a.href = originalUrl;
				}
			} catch (e) {
				console.log('untrack: error while decoding URL for link: ', a, e);
			}
		},

		/* Disqus
		 * E.g. <https://disqus.com/embed/comments/?base=default&f=antirezweblog&t_i=antirez_weblog_new_138&t_u=http%3A%2F%2Fantirez.com%2Fnews%2F138&t_d=In%20defense%20of%20linked%20lists%20-%20%3Cantirez%3E&t_t=In%20defense%20of%20linked%20lists%20-%20%3Cantirez%3E&s_o=default#version=95c5f54d652b3a9f59f3cb30d7904a9e>
		 * has a link to <https://disq.us/url?url=https%3A%2F%2Faphyr.com%2Fposts%2F341-hexing-the-technical-interview%3Aj_d-KTB2pBbDnmt69TBt0Se-Um8&cuid=804356> which redirects to
		 * <https://aphyr.com/posts/341-hexing-the-technical-interview>
		 */
		'a[href^="https://disq.us/url?"][href*="url="], a[href^="http://disq.us/url?"][href*="url="]': a => {
			let originalUrl = new URLSearchParams(new URL(a.href).search)?.get('url');
			if (originalUrl) {
				originalUrl = originalUrl.replace(/:[^:\/]+$/, '');
				a.href = originalUrl;
			}
		},

		/* SoundCloud
		 * E.g. <https://soundcloud.com/dekoergent/jurgen-de-blonde-hometaping-is-killing-music>
		 * has a link to <https://gate.sc/?url=http%3A%2F%2Fwww.dekoer.be%2Fjurgen-de-blonde-hometaping-is-killing-music%2F&token=46b2b3-1-1718098426443> which redirects to
		 * <http://www.dekoer.be/jurgen-de-blonde-hometaping-is-killing-music>
		 */
		'a[href^="https://gate.sc/?"][href*="url="], a[href^="https://gate.sc?"][href*="url="]': a => {
			let originalUrl = new URLSearchParams(new URL(a.href).search)?.get('url');
			if (!originalUrl) {
				return;
			}

			if (a.textContent.trim() === a.href || (a.textContent.includes('…') && originalUrl.includes(a.textContent.split('…')[0]))) {
				a.textContent = originalUrl;
			}

			a.href = originalUrl;
		},

		/* TripAdvisor
		 * E.g. https://www.tripadvisor.com/ExternalLinkInterstitial?redirectTo=http%3A%2F%2Fwww.billigvask.no%2Fself-service-laundromat.html
		 */
		'a[href*="/ExternalLinkInterstitial?"][href*="redirectTo="]': a => {
			const usp = new URLSearchParams(new URL(a.href).search);
			a.href = usp.get('redirectTo') ?? a.href;
		},

		/* Links that were processed by this bookmarklet to restore their
		 * original `A@href` after it was changed on the fly because of user
		 * interaction, e.g. by clicking on Google Ads text links or
		 * Skimlinks affiliate links. */
		'a[data-xxx-jan-original-href]': a => {
			if (a.href !== a.dataset.xxxJanOriginalHref) {
				a.href = a.dataset.xxxJanOriginalHref;
			}
		}
	};

	/**
	 * Return the given query string without the known tracking parameters.
	 */
	function cleanQueryString(queryString) {
		return new URLSearchParams(
			Array.from(new URLSearchParams(queryString))
				.filter(([key, value]) => !key.match(parameterRegexp))
		).toString();
	}

	/**
	 * Clean the query string for the given element’s `href` attribute.
	 */
	function cleanQueryStringForHrefAttribute(element) {
		try {
			const textEqualsUrl = element.textContent.trim() === element.href.trim();

			const oldUrl = new URL(element.href);

			const newUrl = new URL(element.href);
			newUrl.search = cleanQueryString(oldUrl.search);

			if (oldUrl.toString() !== newUrl.toString()) {
				element.href = newUrl;

				if (textEqualsUrl) {
					element.textContent = newUrl;
				}
			}
		} catch (e) {
		}
	}

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/* Update the document location. */
		const oldUrl = new URL(document.location);

		const newUrl = new URL(document.location);
		newUrl.search = cleanQueryString(oldUrl.search);

		if (oldUrl.toString() !== newUrl.toString()) {
			document.defaultView.history.replaceState({}, document.title, newUrl);
		}

		/* Discard Outbrain’s event handlers by removing all the handlers
		 * defined as HTML `onSomeEvent` attributes, and then resetting
		 * the handler-less HTML. */
		document.querySelectorAll('.OUTBRAIN').forEach(element => {
			element.querySelectorAll('a').forEach(a => {
				Array.from(a.attributes).forEach(attribute => {
					if (attribute.name.match(/^on/i)) {
						a.removeAttribute(attribute.name);
					}
				});

				/* Remove placeholder/template URI parameters that look like
				 * `foo=$bar_baz$`. “Normal” tracking parameters can be added to
				 * `parameterPatterns`.
				 */
				const usp = new URLSearchParams(a.search);
				Array.from(usp).forEach(([name, value]) => {
					if (value.match(/^\$.*\$$/)) {
						usp.delete(name);
					}
				});
				a.search = usp.toString();
			});

			element.outerHTML = element.outerHTML;
		});

		/* Keep track of the original `A@href` of Google Ads text links. */
		document.querySelectorAll('[data-text-ad] a[href]').forEach(a => {
			if (a.dataset.xxxJanOriginalHref) {
				return;
			}

			/* Google Ads text links have a bunch of data attributes with possibly
			 * minified names. Just look at the values, not the names, to
			 * determine whether this is an ad whose `A@href` will change
			 * onclick/onmousedown/… */
			let isGoogleAd = Object.entries(a.dataset).some(
				([name, value]) => value.indexOf('https://www.googleadservices.com/pagead') === 0 || value.indexOf('https://www.google.com/aclk') === 0
			);

			if (isGoogleAd) {
				a.dataset.xxxJanOriginalHref = a.href;
			}
		});

		/* Circumvent link redirectors. */
		Object.entries(linkRedirectors).forEach(
			([selector, callback]) => document.querySelectorAll(selector).forEach(element => callback(element))
		);

		/* Update all A@href links in the document. */
		const allAHrefs = Array.from(document.querySelectorAll('a[href]'));

		allAHrefs
			.filter(a => a.href.match(hrefRegexpForWhichToDeleteAllParameters))
			.forEach(a => a.search = '');

		allAHrefs
			.filter(a => a.href.match(hrefRegexp))
			.forEach(a => cleanQueryStringForHrefAttribute(a));

		/* Prevent tracking attributes from being re-added (looking at you, Facebook!) */
		new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				cleanQueryStringForHrefAttribute(mutation.target);

				Object.entries(linkRedirectors).forEach(
					([selector, callback]) => {
						mutation.target.matches(selector) && callback(mutation.target)
					}
				);
			});
		}).observe(document, {
			attributes: true,
			attributeFilter: ['href'],
			subtree: true
		});

		/* Keep track of the original `A@href` of links on pages with
		 * Skimlinks. This needs to be run after all our other code that
		 * changes the `href` values, like the link redirector bypassing
		 * code, or it would undo that code’s effects.
		 *
		 * E.g. https://road.cc/content/feature/13-best-worst-and-wackiest-cycling-crowdfunders-289179
		 */
		if (typeof skimlinksAPI !== 'undefined') {
			document.querySelectorAll('a[href]').forEach(a => {
				if (a.dataset.xxxJanOriginalHref) {
					return;
				}

				a.dataset.xxxJanOriginalHref = a.href;
			});
		}

		/* Show the full URL for all links whose link text looks like a
		 * truncated version of the URL, e.g. showing just the domain
		 * (possibly without protocol/scheme and/or without `www.`), or
		 * hiding part of the path. */
		document.querySelectorAll('a[href]').forEach(a => {
			const normalizedDomainName = a.href.replace(/^https?:\/\/(?:www\.)?([^/]+).*/, '$1');

			const textContainersToCheck = Array.from(a.querySelectorAll('*'));
			textContainersToCheck.unshift(a);
			for (let i = textContainersToCheck.length - 1; i >= 0; i--) {
				const textContainer = textContainersToCheck[i];
				const normalizedInnerText = textContainer.textContent.replace(/^(?:https?:\/\/)?(?:www\.)?([^/]+).*/, '$1');

				if (normalizedDomainName === normalizedInnerText) {
					textContainer.textContent = a.href;
					break;
				}
			}
		});

		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
