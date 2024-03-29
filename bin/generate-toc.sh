#!/bin/bash
# This script creates a JSON ToC for all lectures in Humla.
# The script assumes that individual lecture files are named as lecture{N}.html 
# where {N} is a sequence number of the lecture. The script generates a ToC for every 
# lecture and combines all ToC from all lectures into a single JSON ToC document.  
# The ToC is generated by Humla API by using phantomjs.

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
        rm -f cache/toc-*
	rm -f toc.json
        echo "USECACHE is false, all cached toc files were removed."
fi

# creates the cache directory if it does not exist
mkdir -p cache

# start the http server 
pid=$(ps ax | grep "http-server" | grep $HTTP_PORT | grep -v "grep" | awk '{print $1}')
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
sleep 2

# find all lectures in the current directory, sort by lecture sequence number
ls | egrep "lecture[0-9]+.html" | egrep -o "[0-9]+" | sort -n | \
while read line; do
  lf="lecture$line.html"
  ln=$(printf "%02d" $line)

  tocfile="cache/toc-lecture$ln.html-$(__md5 $lf)"
  if ! [ -f $tocfile ]; then
    echo "Refreshing TOC cache for $lf..."
    rm -f cache/toc-lecture$ln.html-*
    $PHANTOMJS $HUMLA_BIN/pjs_leccontents.js "http://localhost:$HTTP_PORT/$lf" >$tocfile
  fi
done

echo "Generating ToC..."

if [ -e "toc.json" ]; then
	tocmd5=$(__md5 toc.json)
fi

# get the last ToC ToC file
declare -a files
files=(cache/toc-*)
pos=$(( ${#files[*]} - 1 ))
last=${files[$pos]}

# generate the complete json
echo "{ \"lectures\" : [" >toc.json

for file in "${files[@]}"; do
  if [[ $file == $last ]]
  then
     cat $file >>toc.json
     echo "]}" >>toc.json
     break
  else
    cat $file >>toc.json
    echo "," >>toc.json
  fi
done

if [ "$tocmd5" = "$(__md5 toc.json)" ]; then
  echo "ToC has not been modified."
fi

# stop the server
echo "Stopping the http server..."
kill $pid
