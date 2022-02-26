#!/bin/bash
hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
. ../../bin/env.sh

docker run -t -d \
  --restart always \
  --name humla-follow \
  -p ${HUMLA_FOLLOW_PORT}:8080 \
  ${HUMLA_FOLLOW_IMAGE}:${HUMLA_FOLLOW_VERSION} \
  /bin/bash -l -c 'cd /opt/humla/scripts && node follow.js'
