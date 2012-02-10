# Short snippets to run on the command line.
echo 'This is not meant to be run as a stand-alone script. Copy and paste.';
exit 1;

# Copy the last modified bookmarklet to the clipboard.
# Cygwin/Linux users might want to use "putclip"/"xclip" or something similar.
PUTCLIP=; pbcopy < <(file="$(find . -name '*.js' -exec ls -1rt {} + | tail -n 1)" && echo "Copied $file to the clipboard." 1>&2 && perl -p -e 's/\\$//g; s/\n/ /g' "$file");

# Copy the Google Translate bookmarklet from English to some other languages.
copy-2en () {
	source='language/translations/2en.js';
	while [ $# -ge 2 ]; do
		lang="$1";
		name="$2";
		shift;
		shift;
		target="${source/en/$lang}";
		perl -p -e "s/(2|\b)en\b/\$1$lang/g; s/English/$name/g" "$source" > "$target" \
			&& echo "Copied to $target ($name)" \
			|| echo "Failed to copy to $target ($name)";
	done;
}
COPY_2EN=; copy-2en \
	nl Dutch \
	fr French \
	de German \
	it Italian \
	es Spanish \
;

# Copy the Van Dale bookmarklet for some other dictionaries.
copy-vd () {
	source='language/dictionaries/vd.js';
	while [ $# -ge 3 ]; do
		keyword="$1";
		name="$2";
		url="$3";
		shift;
		shift;
		shift;
		target="${source/vd/$keyword}";
		perl -p -e "s/\bvd\b/$keyword/g; s/Van Dale/$name/g; s|http://www.vandale.nl/[^']+|$url|" "$source" > "$target" \
			&& echo "Copied to $target ($name)" \
			|| echo "Failed to copy to $target ($name)";
	done;
}
COPY_VD=; copy-vd \
	mw 'Merriam-Webster' 'http://www.merriam-webster.com/wdictionary/' \
	dict 'Dictionary.com' 'http://dictionary.reference.com/browse/' \
	thes 'Thesaurus.com' 'http://thesaurus.reference.com/browse/' \
	ud 'Urban Dictionary' 'http://www.urbandictionary.com/define.php?term=' \
	nlwikt 'Dutch Wiktionary' 'http://nl.wiktionary.org/wiki/' \
	enwikt 'English Wiktionary' 'http://en.wiktionary.org/wiki/' \
	frwikt 'French Wiktionary' 'http://fr.wiktionary.org/wiki/' \
	dewikt 'German Wiktionary' 'http://de.wiktionary.org/wiki/' \
;

# Copy the English Wikipedia bookmarklet to some other languages.
copy-enw () {
	source='search/wikipedia/enw.js';
	while [ $# -ge 3 ]; do
		lang="$1";
		name="$2";
		keyword="${lang}w";
		shift 2;
		target="${source/enw/$keyword}";
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
;

# Typing is hard; let's go shopping.
alias book="git commit -m 'bookmarks.html: latest update' bookmarks.html";
