
ls lecture* | \
while read lec; do
	echo "* Lecture $lec..."
	tr '\n' ' ' <$lec | grep "h-drawing" | egrep -o "id=\"1[a-zA-Z0-9_\-]+\"" | egrep -o "[a-zA-Z0-9_\-]+" | grep -v "id" | \
	while read line; do
		printf "  Drawing $line.png"
        	wget https://docs.google.com/drawings/export/png?id=$line -O cache/$line.png &>/dev/null
        	if [ $? -eq 0 ]; then
                	echo ", OK"
        	else
                	echo ", ERROR"
			rm -f cache/$line.png
        	fi
	done
	
	if [ $? -ne 0 ]; then
		exit 1
	fi

done

