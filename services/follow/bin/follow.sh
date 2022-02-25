docker run -t -d \
  --restart always \
  --name humla-follow \
  -p ${LOCAL_PORT}:8080 \
  ${FOLLOW_IMAGE} \
  /bin/bash -l -c 'cd /opt/humla/scripts && node follow.js'
