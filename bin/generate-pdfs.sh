#!/bin/sh

# check if phantomjs is installed
phantomjs --version &>/dev/null
if [ $? -ne 0 ]; then
	echo "ToC cannot be generated, phantomjs is not available!"
	exit 1
fi

# get the script directory
CUR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script=$(readlink $BASH_SOURCE)
if [ "$script" != "" ]; then
  fromd=$( cd "$( dirname $BASH_SOURCE )" && pwd )
  CUR_DIR="$fromd/$(dirname $script )"
fi

# creates the output pdf directory if it does not exist
mkdir -p pdf

# start http server 
pid=$(ps ax | grep "http-server" | grep -v "grep" | awk '{print $1}')
if [ "$pid" = "" ]; then
	echo "Starting http server..."
	node $CUR_DIR/http-server.js &>/dev/null &
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
 
  md5file="cache/pdf-lecture$ln.html-$(md5 -q $lf)"  
  if ! [ -f $md5file ] || ! [ -f pdf/lecture$line-2p.pdf ] || ! [ -f pdf/lecture$line-1p.pdf ]; then
    rm -f cache/pdf-lecture$ln.html-*
    echo "Creating pdf for $lf..."
    phantomjs $CUR_DIR/pjs_printpdf.js "http://localhost:9000/$lf" pdf/lecture$line-2p.pdf pdf/lecture$line-1p.pdf
    touch $md5file

    # add pdfs to the commit if the lecture file was modified
    lfmod=$(git status --porcelain | grep "A " | grep $lf | head -1)
    if [ "$lfmod" != "" ]; then
      echo "Staging pdf/lecture$line-2p.pdf and pdf/lecture$line-1p.pdf for commit"
      git add pdf/lecture$line-2p.pdf
      git add pdf/lecture$line-1p.pdf
    fi

  fi
done

# stop the server
echo "Stopping http server..."
kill $pid

