#!/bin/bash
# @author: Tomas Vitvar, tomas@vitvar.com
# This is a wrapper to run humla/bin/generate-pdfs.sh in container

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

source $hdir/../../bin/env.sh
source $hdir/func.sh

__check_docker

[ "${HUMLA_IMAGE}" == "" ] && echo "ERROR: The image humla:${HUMLA_VERSION} does not exist!" && exit 1

__run_container "generate-pdfs.sh"

rm -fr $COURSE_HOME/pdf
docker cp humla-build:/opt/humla/course-int/pdf $COURSE_HOME/pdf

