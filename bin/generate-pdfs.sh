#!/bin/bash

__md5 () {
	if [ "$(uname)" = "Darwin" ]; then
                md5 -q $1
        else
                md5sum $1 | awk '{ print $1 }'
        fi
}

# check if phantomjs is installed
phantomjs --version &>/dev/null
if [ $? -ne 0 ]; then
        echo "ToC cannot be generated, phantomjs is not available!"
        exit 1
fi

HUMLA_BIN="$COURSE_HOME/humla/bin"

# creates the output pdf directory if it does not exist
mkdir -p pdf

# start http server 
pid=$(ps ax | grep "http-server" | grep -v "grep" | awk '{print $1}')
if [ "$pid" = "" ]; then
        echo "Starting http server..."
        node $HUMLA_BIN/http-server.js &
        if [ $? -ne 0 ]; then
                echo "Error occured when starting http-server"
                exit 1
        fi
        pid=$(ps ax | grep "http-server" | grep -v "grep" | awk '{print $1}')
else
        echo "http-server is already running, please stop it before creating pdfs."
        exit 1
fi
echo "The pid of the http-server is $pid"

# find all lectures in the current directory, sort by lecture sequence number
ls | egrep "lecture[0-9]+.html" | egrep -o "[0-9]+" | sort -n | \
while read line; do
  lf="lecture$line.html"
  ln=$(printf "%02d" $line)

  md5file="cache/pdf-lecture$ln.html-$(__md5 $lf)"
  if ! [ -f $md5file ] || ! [ -f pdf/lecture$line-2p.pdf ] || ! [ -f pdf/lecture$line-1p.pdf ]; then
    rm -f cache/pdf-lecture$ln.html-*
    echo "Creating pdf for $lf..."
    phantomjs $HUMLA_BIN/pjs_printpdf.js "http://localhost:9000/$lf" pdf/lecture$line-2p.pdf pdf/lecture$line-1p.pdf
    touch $md5file

  fi
done

# stop the server
echo "Stopping http server..."
kill $pid

