#!/bin/bash
set -e

if [ "$1" = '/docker-command.sh' ]; then

	# check for package installation
	if [ ! -f /etc/shellinabox/pkgs_installed ] && [ -n "$SHELLINABOX_INSTALL_PKGS" ]; then
		apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install $(echo $SHELLINABOX_INSTALL_PKGS | tr "," " ")
		echo $SHELLINABOX_INSTALL_PKGS | tr "," "\n" >/etc/shellinabox/pkgs_installed
	fi

	# get host internal ip
	export DOCKER_HOST=$(/sbin/ip route|awk '/default/ { print $3 }')
	echo "discovered docker host: $DOCKER_HOST"

	# set humla password
	if [ -n "$HUMLA_PASSWORD" ]; then
		echo "setting humla password"
		echo "humla:$HUMLA_PASSWORD" | chpasswd
	fi
	unset SHUMLA_PASSWORD
fi

exec $@

