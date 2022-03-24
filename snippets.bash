# Short snippets to run on the command line.
echo 'This is not meant to be run as a stand-alone script. Copy and paste.';
exit 1;

# Copy the last modified bookmarklet to the clipboard.
# Cygwin/Linux users might want to use "putclip"/"xclip" or something similar.
PUTCLIP=; pbcopy < <(file="$(find . -name '*.js' -exec ls -1rt {} + | tail -n 1)" && echo "Copied $file to the clipboard." 1>&2 && perl -p -e 's/\\$//g; s/\n/ /g' "$file");

# Copy the Google Translate bookmarklet from English to some other languages.
copy-2en () {
	source='language/translations/2en.js';
	while [ $# -ge 4 ]; do
		local bookmarklet_name="$1";
		shift;
		local lang_code="$1";
		shift;
		local lang_name_in_english="$1";
		shift;
		local lang_name_in_other_lowercase="$1";
		shift;
		local this_page_in_xxx_text="$1";
		shift;
		target="${source/2en/$bookmarklet_name}";

		perl -p -e "
				s/\b2en\b/$bookmarklet_name/g;
				s/\ben\b/$lang_code/g;
				s/\bcurrent page in English\b/$this_page_in_xxx_text/g;
				s/\bEnglish\b/$lang_name_in_english/g;
				s/\benglish\b/$lang_name_in_other_lowercase/g;
			" "$source" > "$target" \
			&& echo "Copied to $target ($name)" \
			|| echo "Failed to copy to $target ($name)";
	done;
}

copy_2en_parameters=(
	2nl
	nl
	Dutch
	nederlands
	'deze pagina in het Nederlands'

	2fr
	fr
	French
	français
	'cette page en français'

	2de
	de
	German
	deutsch
	'diese Seite auf Deutsch'

	2it
	it
	Italian
	italiano
	'questa pagina in italiano'

	2es
	es
	Spanish
	español
	'esta página en español'

	2zh
	zh-CN
	'Mandarin Chinese'
	中文
	'this page in Chinese'

	2vi
	vi
	'Vietnamese'
	'tiếng Việt'
	'sang tiếng việt'

	2ru
	ru
	'Russian'
	'русский'
	'эта страница на русском языке'
);
COPY_2EN=; copy-2en "${copy_2en_parameters[@]}";

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
	frwikt 'French Wiktionary' 'in the French Wiktionary' 'https://fr.wiktionary.org/wiki/' \
	dewikt 'German Wiktionary' 'in the German Wiktionary' 'https://de.wiktionary.org/wiki/' \
	itwikt 'Italian Wiktionary' 'in the Italian Wiktionary' 'https://it.wiktionary.org/wiki/' \
	eswikt 'Spanish Wiktionary' 'in the Spanish Wiktionary' 'https://es.wiktionary.org/wiki/' \
	zhwikt 'Mandarin Chinese Wiktionary' 'in the Mandarin Chinese Wiktionary' 'https://zh.wiktionary.org/wiki/' \
	viwikt 'Vietnamese Wiktionary' 'in the Vietnamese Wiktionary' 'https://vi.wiktionary.org/wiki/' \
	ruwikt 'Russian Wiktionary' 'in the Russian Wiktionary' 'https://ru.wiktionary.org/wiki/' \
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
	while [ $# -ge 2 ]; do
		local lang="$1";
		shift;
		local name="$1";
		shift;
		local keyword="${lang}w";
		local target="${source/enw/$keyword}";
		perl -p -e "s/\ben\\.wikipedia/$lang.wikipedia/g; s/\benw\b/$keyword/g; s/English/$name/g" "$source" > "$target" \
			&& echo "Copied to $target ($name)" \
			|| echo "Failed to copy to $target ($name)";
	done;
}
COPY_ENW=; copy-enw \
	nl Dutch \
	fr French \
	de German \
	it Italian \
	es Spanish \
	zh 'Mandarin Chinese' \
	vi 'Vietnamese' \
;

# Typing is hard; let's go shopping.
alias book="git commit -m 'bookmarks.html: latest update' bookmarks.html";
