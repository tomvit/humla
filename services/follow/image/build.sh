#!/bin/bash
# @author Tomas Vitvar, tomas@vitvar.com
# Humla follow service image build script

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
. ../../bin/env.sh

pwd=$(pwd)

PLATFORM=""
if [[ "$OSTYPE" == "darwin"* ]]; then
  PLATFORM="--platform linux/x86_64"
fi

cd $hdir 
docker build ${PLATFORM} -t ${HUMLA_FOLLOW_IMAGE}:${HUMLA_FOLLOW_VERSION} . "$@"
cd $pwd

