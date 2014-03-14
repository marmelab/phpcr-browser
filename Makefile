#/bin/sh

style:  sass/*
		compass compile -e production --force sass/screen.scss

js:		web/assets/js/browser/*
		ngmin web/assets/js/browser/* web/assets/js/browser.js