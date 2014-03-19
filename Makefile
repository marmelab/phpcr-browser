#/bin/sh
FILES := $(ls -1 | awk '{ ORS=" "; print; })

style:  sass/*
		compass compile -e production --force sass/screen.scss

# js:		concat
# 		ngmin web/assets/js/browser.concat.js web/assets/js/browser.js

# concat: web/assets/js/browser/*
# 		cat $(FILES) > web/assets/js/browser.concat.js