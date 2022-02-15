#!/bin/bash
# @author Tomas Vitvar, tomas@vitvar.com
# Humla image build script

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
pwd=$(pwd)

PLATFORM=""
if [[ "$OSTYPE" == "darwin"* ]]; then
  PLATFORM="--platform linux/x86_64"
fi

cd $hdir && docker build ${PLATFORM} -t humla-gh-webhook:1.1 . "$@"

cd $pwd

