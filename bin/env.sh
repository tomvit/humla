#!/bin/bash

# check if CORUSE_HOME was defined, if not set it to the current directory
if [ "$COURSE_HOME" = "" ]; then
	export COURSE_HOME=$(pwd)
	if [[ -z ${SUPPRESS_WARNINGS} || ${SUPPRESS_WARNINGS} -eq 0 ]]; then
	    echo "WARN: COURSE_HOME env variable has not been set..."
	    echo "WARN: COURSE_HOME env variable set to the current direcory, the value is $COURSE_HOME"
	fi
fi

# HUMLA_BIN points to Humla scripts directory
if [[ -z ${IGNORE_HUMLA_BIN} || ${IGNORE_HUMLA_BIN} -eq 0 ]]; then
  export HUMLA_BIN="$COURSE_HOME/humla/bin"
  if ! [ -d "$HUMLA_BIN" ]; then
  	echo "ERROR: $HUMLA_BIN does not exist! Is COURSE_HOME the home of the course?"	
  	exit 1
  fi
fi

export HTTP_PORT=9009
export HUMLA_VERSION=1.0

[ -z ${PHANTOMJS} ] && export PHANTOMJS="phantomjs"
[ -z ${HUMLA_IMAGE} ] && docker &>/dev/null && export HUMLA_IMAGE=$(docker images | awk '{print $1":"$2}' | grep "humla:${HUMLA_VERSION}")

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
	$PHANTOMJS --version &>/dev/null
	if [ $? -ne 0 ]; then
        	echo "ERROR: phantomjs cannot be found!"
        	exit 1
	fi
}

# check if node is installed
__check_node() {
        node --version &>/dev/null
        if [ $? -ne 0 ]; then
                echo "ERROR: Node cannot be found!"
                exit 1
        fi
}

__check_docker() {
        [[ "$(docker --version &>/dev/null; echo $?)" -gt 0 ]] && echo "ERROR: The docker is not installed!" && exit 1
}

# returns the number of lectures in the COURSE_DIR
__num_lectures() {
	local numlec=$(ls $1 | egrep "lecture[0-9]+.html" | egrep -o "[0-9]+" | wc -l)
	echo $numlec
}

