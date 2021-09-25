#!/bin/bash
# @author: Tomas Vitvar, tomas@vitvar.com
# This is a wrapper to run humla/bin/generate-pdfs.sh in container

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

export SUPPRESS_WARNINGS=1
export IGNORE_HUMLA_BIN=1

source $hdir/../../bin/env.sh
source $hdir/func.sh

__check_docker

[ "${HUMLA_IMAGE}" == "" ] && echo "ERROR: The image ${HUMLA_IMAGE} does not exist!" && exit 1

function help() {
cat << EOF
Usage: $(basename $0) -repo <REPO_NAME> -token <TOKEN>

Run Github Webhook service.

Required arguments:
  -repo               Valid GitHub repository (without protocol).
  -token              Access token.
EOF
}

# parse input arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -repo)
    GITHUB_REPO="$2"
    shift; shift
    ;;
    -token)
    GITHUB_TOKEN="$2"
    shift; shift
    ;;
    -h)
    help
    exit 0
    ;;
    *)
    echo "ERROR: Unkown option $1"
    exit 1
    ;;
  esac
done

[ -z $GITHUB_REPO ] && echo "ERROR: The -repo option is required!" && exit 1
[ -z $GITHUB_TOKEN ] && echo "ERROR: The -token option is required!" && exit 1

docker run --rm \
  --name gh-webhook \
  -p 80:8080 \
  -e GITHUB_REPO="$GITHUB_REPO" -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  ${HUMLA_IMAGE} \
  /bin/bash -l -c 'cd /opt/humla/scripts/ && node github-webhook.js'


