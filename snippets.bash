# Short snippets to run on the command line.
echo 'This is not meant to be run as a stand-alone script. Copy and paste.';
exit 1;

# Copy the translation bookmarklet from English to some other languages.
copy-2en () {
	source='language/translations/2en.js';
	local bookmarklet_name="$1";
	local lang_name_in_english="$2";
	local js_config_body="$3";
	target="${source/2en/$bookmarklet_name}";

	local is_in_header=true;
	local is_in_function_body=false;
	local is_in_js_config_body=false;
	local is_in_footer=false;
	while IFS=$'\n' read -r line; do
		#echo "LINE: >$line<" 1>&2;
		if $is_in_header; then
			line="${line//2en/$bookmarklet_name}";
			line="${line//English/$lang_name_in_english}";
			if [ "$line" = ' */' ]; then
				is_in_header=false;
				is_in_function_body=true;
			fi;
			echo "$line";
		elif $is_in_function_body; then
			if [[ "$line" =~ Begin\ JS\ config\ object ]]; then
				is_in_function_body=false;
				is_in_js_config_body=true;
				echo "$js_config_body";
			else
				echo "$line";
			fi;
		elif $is_in_js_config_body; then
			if [[ "$line" =~ End\ JS\ config\ object ]]; then
				is_in_js_config_body=false;
				is_in_footer=true;
			fi;
		elif $is_in_footer; then
			echo "$line";
		else
			echo "WTF am I? $line" 1>&2;
		fi;
	done < "$source" >| "$target" \
		&& echo "Copied to $target ($lang_name_in_english)" \
		|| echo "Failed to copy to $target ($lang_name_in_english)";
}

copy_2en_parameters=(
	# ↓ Keyword/bookmarklet name (and filename)
	2nl

	# ↓ s/English/XXX/g in the docblock
	Dutch

	# ↓ JavaScript `config` object body
"
	keyword: '2nl',
	languageCodes: ['nl', 'nl-BE', 'nl-NL'],
	languageNamesInEnglish: ['Dutch'],
	languageNativeNames: ['Nederlands'],
	thisPageInNativeNameTexts: ['deze pagina in het Nederlands', 'versie in het Nederlands', 'Nederlandse versie', 'Nederlandstalige versie'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2de
	German
"
	keyword: '2de',
	languageCodes: ['de', 'de-DE', 'de-AT', 'de-CH', 'de-LU'],
	languageNamesInEnglish: ['German'],
	languageNativeNames: ['Deutsch'],
	thisPageInNativeNameTexts: ['diese Seite auf Deutsch', 'Version auf Deutsch', 'Deutsche Version'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2es
	Spanish
"
	keyword: '2es',
	languageCodes: ['es', 'es-ES'],
	languageNamesInEnglish: ['Spanish'],
	languageNativeNames: ['español'],
	thisPageInNativeNameTexts: ['esta página en español', 'versión en español'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2fr
	French
"
	keyword: '2fr',
	languageCodes: ['fr', 'fr-FR', 'fr-BE'],
	languageNamesInEnglish: ['French'],
	languageNativeNames: ['français'],
	thisPageInNativeNameTexts: ['cette page en français', 'version en français', 'version française', 'version francophone'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2it
	Italian
"
	keyword: '2it',
	languageCodes: ['it', 'it-IT', 'it-CH'],
	languageNamesInEnglish: ['Italian'],
	languageNativeNames: ['italiano'],
	thisPageInNativeNameTexts: ['questa pagina in italiano', 'questo sito in italiano', 'versione in italiano'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2no
	Norwegian
"
	keyword: '2no',
	languageCodes: ['no', 'no-NO', 'nb', 'nb-NO', 'nn', 'nn-NO'],
	languageNamesInEnglish: ['Norwegian'],
	languageNativeNames: ['Norsk'],
	thisPageInNativeNameTexts: ['denne siden på norsk', 'denne siden på bokmål', 'denne siden på nynorsk', 'norsk versjon', 'bokmålsversjon', 'nynorsk versjon', 'versjon på norsk', 'versjon på nynorsk', 'versjon på bokmål'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2pt
	Portuguese
"
	keyword: '2pt',
	languageCodes: ['pt', 'pt-PT', 'pt-BR'],
	languageNamesInEnglish: ['Portuguese'],
	languageNativeNames: ['português'],
	thisPageInNativeNameTexts: ['esta página em português', 'este site em português', 'versão em português'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2ru
	Russian
"
	keyword: '2ru',
	languageCodes: ['ru', 'ru-RU'],
	languageNamesInEnglish: ['Russian'],
	languageNativeNames: ['русский'],
	thisPageInNativeNameTexts: ['эта страница на русском языке', 'этот сайт на русском языке', 'русская версия'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2sv
	Swedish
"
	keyword: '2sv',
	languageCodes: ['sv', 'sv-SE'],
	languageNamesInEnglish: ['Swedish'],
	languageNativeNames: ['svenska'],
	thisPageInNativeNameTexts: ['denna sida på svenska', 'svensk version', 'version på svenska'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2vi
	Vietnamese
"
	keyword: '2vi',
	languageCodes: ['vi', 'vi-VN'],
	languageNamesInEnglish: ['Vietnamese'],
	languageNativeNames: ['tiếng Việt'],
	thisPageInNativeNameTexts: ['trang này bằng tiếng Việt', 'phiên bản tiếng Việt', 'sang tiếng việt'],
"
)
copy-2en "${copy_2en_parameters[@]}";

copy_2en_parameters=(
	2zh
	'(Mandarin) Chinese'
"
	keyword: '2zh',
	languageCodes: ['zh', 'zh-CN', 'zh-Hans', 'zh-TW', 'zh-Hant', 'cmn-TW'],
	languageCodeForGoogleTranslate: 'zh-CN',
	languageNamesInEnglish: ['Chinese'],
	languageNativeNames: ['汉语', '漢語', '國語', '華語'],
	thisPageInNativeNameTexts: ['为中文', '中文版', '為中文'],
"
)
copy-2en "${copy_2en_parameters[@]}";

# Copy the English Wiktionary bookmarklet for some other dictionaries.
copy-enwikt () {
	local source='language/dictionaries/enwikt.js';
	while [ $# -ge 3 ]; do
		local keyword="$1";
		shift;
		local name="$1";
		shift;
		local in_the_dictionary="$1";
		shift;
		local url="$1";
		shift;
		local target="${source/enwikt/$keyword}";

		perl -p -e "s/\benwikt\b/$keyword/g; s/in the English Wiktionary/$in_the_dictionary/g; s/English Wiktionary/$name/g; s|https://en\.wiktionary\.org/[^']+|$url|" "$source" > "$target" \
			&& echo "Copied to $target ($name)" \
			|| echo "Failed to copy to $target ($name)";
	done;
}

COPY_ENWIKT=; copy-enwikt \
	nlwikt 'Dutch Wiktionary' 'in the Dutch Wiktionary' 'https://nl.wiktionary.org/wiki/' \
	dewikt 'German Wiktionary' 'in the German Wiktionary' 'https://de.wiktionary.org/wiki/' \
	eswikt 'Spanish Wiktionary' 'in the Spanish Wiktionary' 'https://es.wiktionary.org/wiki/' \
	frwikt 'French Wiktionary' 'in the French Wiktionary' 'https://fr.wiktionary.org/wiki/' \
	itwikt 'Italian Wiktionary' 'in the Italian Wiktionary' 'https://it.wiktionary.org/wiki/' \
	nowikt 'Norwegian Wiktionary' 'in the Norwegian Wiktionary' 'https://no.wiktionary.org/wiki/' \
	ptwikt 'Portuguese Wiktionary' 'in the Portuguese Wiktionary' 'https://pt.wiktionary.org/wiki/' \
	ruwikt 'Russian Wiktionary' 'in the Russian Wiktionary' 'https://ru.wiktionary.org/wiki/' \
	svwikt 'Swedish Wiktionary' 'in the Swedish Wiktionary' 'https://sv.wiktionary.org/wiki/' \
	viwikt 'Vietnamese Wiktionary' 'in the Vietnamese Wiktionary' 'https://vi.wiktionary.org/wiki/' \
	zhwikt '(Mandarin) Chinese Wiktionary' 'in the (Mandarin) Chinese Wiktionary' 'https://zh.wiktionary.org/wiki/' \
	vd 'Van Dale' 'in the Dutch Van Dale dictionary' 'https://www.vandale.nl/gratis-woordenboek/nederlands/betekenis/' \
	vw 'Vlaams Woordenboek' 'in the “Flemish” dictionary' 'https://www.vlaamswoordenboek.be/definities/search?definition[q]=' \
	oed 'O.E.D.' 'in the Oxford English dictionary' 'https://en.oxforddictionaries.com/definition/' \
	mw 'Merriam-Webster' 'using Merriam-Webster' 'https://www.merriam-webster.com/dictionary/' \
	dict 'Dictionary.com' 'on Dictionary.com' 'https://www.dictionary.com/browse/' \
	thes 'Thesaurus.com' 'on Thesaurus.com' 'https://www.thesaurus.com/browse/' \
	ud 'Urban Dictionary' 'in the Urban Dictionary' 'https://www.urbandictionary.com/define.php?term=' \
	ac 'Arch Chinese' 'in the Arch Chinese dictionary' 'https://www.archchinese.com/chinese_english_dictionary.html?find=' \
;

# Copy the English Wikipedia bookmarklet to some other languages.
copy-enw () {
	local source='search/wikipedia/enw.js';
	local bookmarklet_name="$1";
	local lang_name_in_english="$2";
	local js_config_body="$3";
	target="${source/enw/$bookmarklet_name}";

	local is_in_header=true;
	local is_in_function_body=false;
	local is_in_js_config_body=false;
	local is_in_footer=false;
	while IFS=$'\n' read -r line; do
		#echo "LINE: >$line<" 1>&2;
		if $is_in_header; then
			line="${line//@keyword enw/@keyword $bookmarklet_name}";
			line="${line// English / $lang_name_in_english }";
			if [ "$line" = ' */' ]; then
				is_in_header=false;
				is_in_function_body=true;
			fi;
			echo "$line";
		elif $is_in_function_body; then
			if [[ "$line" =~ Begin\ JS\ config\ object ]]; then
				is_in_function_body=false;
				is_in_js_config_body=true;
				echo "$js_config_body";
			else
				echo "$line";
			fi;
		elif $is_in_js_config_body; then
			if [[ "$line" =~ End\ JS\ config\ object ]]; then
				is_in_js_config_body=false;
				is_in_footer=true;
			fi;
		elif $is_in_footer; then
			echo "$line";
		else
			echo "WTF am I? $line" 1>&2;
		fi;
	done < "$source" >| "$target" \
		&& echo "Copied to $target ($lang_name_in_english)" \
		|| echo "Failed to copy to $target ($lang_name_in_english)";
}

copy_enw_parameters=(
	# ↓ Keyword/bookmarklet name (and filename)
	nlw

	# ↓ s/English/XXX/g in the docblock
	Dutch

	# ↓ JavaScript `config` object body
"
	languageCode: 'nl',
	languageNamesInEnglish: ['Dutch'],
	disambigationPageSuffix: ' (doorverwijspagina)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	dew
	German
"
	languageCode: 'de',
	languageNamesInEnglish: ['German'],
	disambigationPageSuffix: ' (Begriffsklärung)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	esw
	Spanish
"
	languageCode: 'es',
	languageNamesInEnglish: ['Spanish'],
	disambigationPageSuffix: ' (desambiguación)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	frw
	French
"
	languageCode: 'fr',
	languageNamesInEnglish: ['French'],
	disambigationPageSuffix: ' (homonymie)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	itw
	Italian
"
	languageCode: 'it',
	languageNamesInEnglish: ['Italian'],
	disambigationPageSuffix: ' (disambigua)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	now
	Norwegian
"
	languageCode: 'no',
	languageNamesInEnglish: ['Norwegian'],
	disambigationPageSuffix: ' (andre betydninger)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	ptw
	Portuguese
"
	languageCode: 'pt',
	languageNamesInEnglish: ['Portuguese'],
	disambigationPageSuffix: ' (desambiguação)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	ruw
	Russian
"
	languageCode: 'ru',
	languageNamesInEnglish: ['Russian'],
	disambigationPageSuffix: ' (значения)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	svw
	Swedish
"
	languageCode: 'sv',
	languageNamesInEnglish: ['Swedish'],
	disambigationPageSuffix: ' (olika betydelser)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	viw
	Vietnamese
"
	languageCode: 'vi',
	languageNamesInEnglish: ['Vietnamese'],
	disambigationPageSuffix: ' (định hướng)',
"
)
copy-enw "${copy_enw_parameters[@]}";

copy_enw_parameters=(
	zhw
	Chinese
"
	languageCode: 'zh',
	languageNamesInEnglish: ['Chinese'],
	disambigationPageSuffix: ' (消歧义)',
"
)
copy-enw "${copy_enw_parameters[@]}";

# Typing is hard; let's go shopping.
alias book="git commit -m 'bookmarks.html: latest update' bookmarks.html";
