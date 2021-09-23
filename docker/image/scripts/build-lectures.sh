#!/bin/bash
# @author: Tomas Vitvar, 21/9/2021, tomas@vitvar.com
# lectures build script, based on travis build script from https://github.com/tomvit/mdw/blob/ws-20-21/.travis.yml
# This requires certain binaries and should be run in a container using the humla build image, see build/Dockerfile for details

function check_env() {
  eval "[ -z \${$1} ]" && echo "ERROR: The env variable \${$1} must be set!" && return 1
  return 0
}

# check env variables
check_env "GITHUB_REPO" || exit 1
#check_env "GITHUB_TOKEN" || exit 1
#check_env "COURSE_HOME" || exit 1

[ -z ${USE_CACHE} ] && USE_CACHE=0 

echo "Lectures build script"
echo "GITHUB_REPO=${GITHUB_REPO}"
#echo "GITHUB_TOKEN=(set)"
#echo "COURSE_HOME=${COURSE_HOME}"
echo "USE_CACHE=${USE_CACHE}"

BUILD_DIR="/opt/humla/build"

rm -rf ${BUILD_DIR}
#git clone https://${GITHUB_TOKEN}@${GITHUB_REPO} ${BUILD_DIR}
git clone https://${GITHUB_REPO} ${BUILD_DIR}
cd ${BUILD_DIR}
git submodule update --init --recursive
git config --global user.email "humla-build"
git config --global user.name "humla-build"
git checkout gh-pages
git fetch
git merge origin/master --no-commit || true
#export COURSE_HOME=$(pwd)
humla/bin/generate-toc.sh $USECACHE
humla/bin/generate-pdfs.sh $USECACHE
git add -A .
git commit -a -m "Humla build" || true
#git push --quiet origin gh-pages > /dev/null 2>&1
