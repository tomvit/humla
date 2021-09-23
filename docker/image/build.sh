#!/bin/bash
# @author Tomas Vitvar, tomas@vitvar.com
# Humla image build script

hdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
pwd=$(pwd)

cd $hdir && docker build --platform linux/x86_64 -t humla:1.0 .

cd $pwd

