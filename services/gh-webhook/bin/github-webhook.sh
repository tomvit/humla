#!/bin/bash
# @author: Tomas Vitvar, tomas@vitvar.com
# This is a wrapper to run humla/bin/generate-pdfs.sh in container

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

export SUPPRESS_WARNINGS=1
export IGNORE_HUMLA_BIN=1

source $hdir/../../../bin/env.sh
source $hdir/func.sh

__check_docker

[ -z ${HUMLA_IMAGE} ] && echo "ERROR: The env varaible \${HUMLA_IMAGE} is not defined!" && exit 1

function help() {
cat << EOF
Usage: $(basename $0) -config

Run Github Webhook service.

Required arguments:
  -config             Web hook configuraiton file.
  -p                  tcp port to listen on
EOF
}

# parse input arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -config)
    CONFIG="$2"
    shift; shift
    ;;
   -p)
    LOCAL_PORT="$2"
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

[ -z ${CONFIG} ] && echo "The config was not specified!" && exit 1
[ -z ${LOCAL_PORT} ] && echo "The tcp port was not specified!" && exit 1

docker run -t -d \
  --restart always \
  --name humla-gh-webhook \
  -p ${LOCAL_PORT}:8080 \
  -v $(realpath $CONFIG):/opt/humla/scripts/gh-webhook/config.json \
  -v $(pwd)/gh-webhook-logs:/opt/humla/logs \
  ${HUMLA_IMAGE} \
  /bin/bash -l -c 'cd /opt/humla/scripts/gh-webhook && node gh-webhook.js'

