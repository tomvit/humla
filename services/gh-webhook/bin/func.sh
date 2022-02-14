#!/bin/bash

function __run_container() {
   docker run \
    --platform linux/x86_64 -t \
    -v $COURSE_HOME:/opt/humla/course \
    --env "SUPPRESS_WARNINGS=1" \
    --env "SCRIPT=$1" \
    --name humla-build ${HUMLA_IMAGE} \
    bash -l -c '
      mkdir /opt/humla/course-int && \
      echo "Copying the course content..." && \
      cd /opt/humla/course-int && \
      cp /opt/humla/course/*.html . && \
      cp /opt/humla/course/*.json . && \
      cp /opt/humla/course/Makefile . && \
      cp -R /opt/humla/course/humla . && \
      cp -R /opt/humla/course/css . && \
      cp -R /opt/humla/course/bin . && \
      cp -R /opt/humla/course/lib . && \
      cp -R /opt/humla/course/img . && \
      echo "Running the pdf geneation..." && \
      humla/bin/${SCRIPT} 0
    '

  trap '
    echo "Removing the container with name humla-build"
    docker rm humla-build &>/dev/null || echo "ERROR: Error occured when removing the container."
  ' EXIT
}
