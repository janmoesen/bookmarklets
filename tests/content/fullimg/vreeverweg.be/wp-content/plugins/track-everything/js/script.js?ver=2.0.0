jQuery(function ($) {
	// Grab Settings
	var config = window.trackeverything;

	// This is to mantain backwards compatability, in case anyone seriously hacked on WPTE
	config.options = config.settings;
	delete config.settings;

	$("html").track(config);

	// Go beyond jQTE to do what the plugin did previously
	// Remove Searches (if requested)
	if(config.options.search == false){
		//  && $(this).attr("method") && $(this).attr("method").toLowerCase() == "get" && $(this).children("input[name=s]").length
		$("form input[name=s]").each(function () {
			var $form = $(this);
			if(!$form.attr("method") || ($form.attr("method") && $form.attr("method").toLowerCase() == "get")){
				$form.off(".track-everything-default").removeClass("track-everything-default");
			}
		});
	}

	// Track Rank
	if(config.options.googlerank){

		if (document.referrer.match(/google\.com/gi) && document.referrer.match(/cd/gi)) {
			var referrerInfo = document.referrer;
			var r = referrerInfo.match(/cd=(.*?)&/);
			var rank = parseInt(r[1]);
			var kw = referrerInfo.match(/q=(.*?)&/);
			
			if (kw[1].length > 0) {
				var keyword = decodeURI(kw[1]);
			} else {
				keyword = "(not provided)";
			}

			var path = document.location.pathname;
			_gaq.push(['_trackEvent', 'Google Search', keyword, path, rank, true]);
		}

	}
});