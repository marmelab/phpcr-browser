#/bin/sh
FILES := $(ls -1 | awk '{ ORS=" "; print; })

style:  sass/*
		compass compile -e production --force sass/screen.scss
