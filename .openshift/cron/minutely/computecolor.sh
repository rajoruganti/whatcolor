#!/bin/bash
export LD_LIBRARY_PATH=$OPENSHIFT_DATA_DIR/usr/local/lib
export NODE_ENV="production"
MIN=`date +%M`
if [ $((${MIN#0} % 10)) == 0 ]; then
    echo "computing"
    $OPENSHIFT_DATA_DIR/node-v0.9.1-linux-x64/bin/node $OPENSHIFT_REPO_DIR/computecolor.js
else
    echo "not computing"
fi
