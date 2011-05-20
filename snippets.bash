# Short snippets to run on the command line.
echo 'This is not meant to be run as a stand-alone script. Copy and paste.';
exit 1;

# Copy the last modified bookmarklet to the clipboard.
# Cygwin/Linux users might want to use "putclip"/"xclip" or something similar.
PUTCLIP=; pbcopy < <(file="$(find . -name '*.js' -exec ls -1rt {} + | tail -n 1)" && echo "Copied $file to the clipboard." 1>&2 && cat "$file");

# Copy the Google Translate bookmarklet from English to some other languages.
copy-2en () {
	source='language/translations/2en.js';
	while [ $# -ge 2 ]; do
		lang="$1";
		name="$2";
		shift;
		shift;
		perl -p -e "s/(2|\b)en\b/\$1$lang/g; s/English/$name/g" "$source" > "${source/en/$lang}" \
			&& echo "Copied to $name" \
			|| echo "Failed to copy to $name";
	done;
}
COPY_2EN=; copy-2en nl Dutch fr French de German it Italian es Spanish

# Typing is hard; let's go shopping.
alias book="git commit -m 'bookmarks.html: latest update' bookmarks.html";
