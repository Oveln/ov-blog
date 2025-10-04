#!/bin/sh
echo "GIT_COMMIT_ID=$(git rev-parse HEAD)" > .build-meta
echo "GIT_COMMIT_TIME=$(git show -s --format=%ci HEAD)" >> .build-meta
echo "BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> .build-meta
