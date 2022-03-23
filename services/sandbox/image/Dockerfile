# sandbox build scrip; this is a modified version of https://github.com/spali/docker-shellinabox
FROM ubuntu:18.04

RUN groupadd -r shellinabox && useradd -r -g shellinabox shellinabox && \
    groupadd -g 992 docker && \
    useradd -u 1001 -g docker -m -s /bin/bash humla

RUN rm /etc/update-motd.d/10-help-text && \
    rm /etc/update-motd.d/50-motd-news && \
    rm /etc/update-motd.d/60-unminimize

RUN apt-get update && \
    apt-get -y install shellinabox ssh sudo vim net-tools iputils-ping

COPY scripts/shellinabox_services /shellinabox_services

RUN chmod 600 /shellinabox_services

EXPOSE 4200

COPY scripts/docker-entrypoint.sh /
COPY scripts/docker-command.sh /
COPY scripts/10-humla-text /etc/update-motd.d/

RUN chmod +x /etc/update-motd.d/10-humla-text && \
    chmod +x /docker-entrypoint.sh /docker-command.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["/docker-command.sh"]

