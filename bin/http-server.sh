#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPT_DIR/env.sh

# check node is installed
__check_node

numlec=$(__num_lectures $COURSE_HOME)
if [ "$numlec" -eq 0 ]; then
        echo "There are no lecture files, nothing to serve!"
        exit 0
fi

cd $COURSE_HOME
echo "There are $numlec lecture files."

node $HUMLA_BIN/http-server.js 9000 
