#!/bin/bash
# The humla sandbox start script. There are two parameters that you need to provide,
# a name of the local service under which the sandbox will be available, and 
# a password for the humla user to login to the sandbox. 

SERVICE_LOCAL=$(read -s -p "Enter a name for a local service: " && echo $REPLY)
echo "(provided)"
HUMLA_PASSWORD=$(read -s -p "Enter a password for user 'humla': " && echo $REPLY)
echo "(provided)"

docker run -d \
  --name humla-sandbox \
  --hostname sandbox \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  --net services_network --ip 192.168.20.13 \
  -e SHELLINABOX_SERVICE_LOCAL=${SERVICE_LOCAL} \
  -e HUMLA_PASSWORD=${HUMLA_PASSWORD} \
  -e SHELLINABOX_DISABLE_SSL=1 \
  humla-sandbox:1.0

unset HUMLA_PASSWORD
unset SERVICE_LOCAL
