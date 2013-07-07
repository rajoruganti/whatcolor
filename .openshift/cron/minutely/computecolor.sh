#!/bin/bash
export LD_LIBRARY_PATH=$OPENSHIFT_DATA_DIR/usr/local/lib
MIN=`date +%M`
if [ $((${MIN#0} % 1)) == 0 ]; then
    $OPENSHIFT_DATA_DIR/node-v0.9.1-linux-x64/bin/node $OPENSHIFT_REPO_DIR/computecolor.js
fi
