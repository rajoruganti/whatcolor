if [$(($(date +%H) % 12)) == 0 ]; then
	# run the script
	/usr/local/bin/node $OPENSHIFT_REPO_DIR/computecolor.js
fi