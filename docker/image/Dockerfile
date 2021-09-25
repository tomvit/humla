FROM ubuntu:18.04

RUN apt-get update && \
    apt-get install -y locales fontconfig git nodejs npm && \
    rm -rf /var/lib/apt/lists/* && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

RUN mkdir -p /opt/humla/install && mkdir /opt/humla/scripts

COPY files/fonts-humla.tar.gz /opt/humla/install/
COPY files/phantomjs-2.1.1-linux-x86_64.tar.bz2 /opt/humla/install/
COPY scripts/* /opt/humla/scripts/

RUN mkdir /opt/humla/phantomjs && \
    tar -xvf /opt/humla/install/phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /opt/humla/phantomjs/ --strip-components=1

ENV PHANTOMJS="/opt/humla/phantomjs/bin/phantomjs"

RUN cd /opt/humla/install && \
    tar xvzf fonts-humla.tar.gz && \
    mv fonts-humla /usr/share/fonts/ && \
    fc-cache -f -v

RUN cd /opt/humla/scripts && npm install 

RUN rm -fr /opt/humla/install

RUN echo "export PATH=/opt/humla/phantomjs/bin:$PATH" >> /root/.bashrc

WORKDIR /opt/humla


