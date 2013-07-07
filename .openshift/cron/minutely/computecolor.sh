#!/bin/bash
MIN=`date +%M`
if [ $((${MIN#0} % 1)) == 0 ]; then
    /usr/bin/node $OPENSHIFT_REPO_DIR/computecolor.js
fi
