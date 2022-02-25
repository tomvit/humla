FROM ubuntu:18.04

RUN apt-get update && \
    apt-get install -y locales git curl && \
    rm -rf /var/lib/apt/lists/* && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && apt-get install -y nodejs

RUN mkdir -p /opt/humla/scripts && mkdir /opt/humla/logs

COPY scripts/ /opt/humla/scripts/

RUN cd /opt/humla/scripts && npm install 

WORKDIR /opt/humla


