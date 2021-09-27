#!/bin/bash
# @author: Tomas Vitvar, tomas@vitvar.com
# public humla course to gh-pages

env 

echo "*******"

pdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )

[ -z ${GITHUB_REPO} ] && echo "ERROR: The env variable \$GITHUB_REPO must be defined!" && exit 1
[ -z ${GITHUB_TOKEN} ] && echo "ERROR: The env variable \$GITHUB_TOKEN must be defined!" && exit 1

BUILD_DIR="$pdir/workspace/$(echo $GITHUB_REPO | awk -F/ '{print $NF}')"

rm -fr ${BUILD_DIR}
mkdir -p ${BUILD_DIR}

git clone https://${GITHUB_TOKEN}@${GITHUB_REPO} ${BUILD_DIR}
cd ${BUILD_DIR}

git submodule update --init --recursive
git config --global user.email "humla-build"
git config --global user.name "humla-build"
git checkout gh-pages
git fetch
git merge origin/master --no-commit || exit 1

rm -f pdf/*

export COURSE_HOME=$(pwd)
humla/bin/generate-toc.sh $USECACHE
humla/bin/generate-pdfs.sh $USECACHE

git add -A .
git commit -a -m "Humla build" || exit 1
git push --quiet origin gh-pages > /dev/null 2>&1

