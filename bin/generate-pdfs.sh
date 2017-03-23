#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPT_DIR/env.sh

# check phantomjs and node is installed
__check_pjs
__check_node

numlec=$(__num_lectures $COURSE_HOME)
if [ "$numlec" -eq 0 ]; then
	echo "There are no lecture files, nothing to process!"
	exit 0
fi

cd $COURSE_HOME
echo "There are $numlec lecture files."

# use cache set to false
if [ "$1" = "0" ]; then
        # remove cache, will be all created 
	rm -f cache/pdf-* 
	echo "USECACHE is false, all cached pdf files were removed."
fi

# creates the output cache and pdf directories 
mkdir -p cache
mkdir -p pdf

# start the http server 
pid=$(ps ax | grep "http-server" | grep -v "grep" | awk '{print $1}')
if [ "$pid" = "" ]; then
        echo "Starting http server on port $HTTP_PORT in quiet mode..."
        node $HUMLA_BIN/http-server.js $HTTP_PORT --quiet &
        if [ $? -ne 0 ]; then
                echo "Error occured when starting the server."
                exit 1
        fi
        pid=$(ps ax | grep "http-server" | grep -v "grep" | awk '{print $1}')
else
        echo "http-server is already running, please stop it before running the script."
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
    phantomjs $HUMLA_BIN/pjs_printpdf.js "http://localhost:$HTTP_PORT/$lf" pdf/lecture$line-2p.pdf pdf/lecture$line-1p.pdf
    touch $md5file
  fi
done

# stop the server
echo "Stopping the http server..."
kill $pid

