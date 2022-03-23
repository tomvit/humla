#!/bin/bash
# @author Tomas Vitvar, tomas@vitvar.com
# Humla sandbox service image build script

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
. ../../bin/env.sh

pwd=$(pwd)

PLATFORM=""
if [[ "$OSTYPE" == "darwin"* ]]; then
  PLATFORM="--platform linux/x86_64"
fi

cd $hdir 
docker build ${PLATFORM} -t ${HUMLA_SANDBOX_IMAGE}:${HUMLA_SANDBOX_VERSION} . "$@"
cd $pwd

