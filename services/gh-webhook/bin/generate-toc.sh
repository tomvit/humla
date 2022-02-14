#!/bin/bash
# @author: Tomas Vitvar, tomas@vitvar.com
# This is a wrapper to run humla/bin/generate-pdfs.sh in container

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

source $hdir/../../bin/env.sh
source $hdir/func.sh

__check_docker

[ "${HUMLA_IMAGE}" == "" ] && echo "ERROR: The image humla:${HUMLA_VERSION} does not exist!" && exit 1

__run_container "generate-toc.sh"

docker cp humla-build:/opt/humla/course-int/toc.json $COURSE_HOME/

