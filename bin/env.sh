#!/bin/bash

# check if CORUSE_HOME was defined, if not set it to the current directory
if [ "$COURSE_HOME" = "" ]; then
	export COURSE_HOME=$(pwd)
	echo "COURSE_HOME env variable has not been set..."
	echo "COURSE_HOME env variable set to the current direcory, the value is $COURSE_HOME"
fi

# HUMLA_BIN points to Humla scripts directory
export HUMLA_BIN="$COURSE_HOME/humla/bin"
if ! [ -d "$HUMLA_BIN" ]; then
	echo "$HUMLA_BIN does not exist! Is COURSE_HOME the home of the course?"	
	exit 1
fi

export HTTP_PORT=9009

# utility functions
# md5 function
__md5 () {
        if [ "$(uname)" = "Darwin" ]; then
                md5 -q $1
        else
                md5sum $1 | awk '{ print $1 }'
        fi
}

# check if phantomjs is installed
__check_pjs() {
	phantomjs --version &>/dev/null
	if [ $? -ne 0 ]; then
        	echo "phantomjs cannot be found!"
        	exit 1
	fi
}

# check if node is installed
__check_node() {
        node --version &>/dev/null
        if [ $? -ne 0 ]; then
                echo "Node cannot be found!"
                exit 1
        fi
}

# returns the number of lectures in the COURSE_DIR
__num_lectures() {
	local numlec=$(ls $1 | egrep "lecture[0-9]+.html" | egrep -o "[0-9]+" | wc -l)
	echo $numlec
}





