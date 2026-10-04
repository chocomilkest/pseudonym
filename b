#!/usr/bin/env bash

set -euo pipefail

project_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd "$project_dir"

./node_modules/.bin/tsc

staging_dir=$(mktemp -d /tmp/pseudonym-build.XXXXXX)
trap 'rm -rf -- "$staging_dir"' EXIT

cp -R dist/src "$staging_dir/src"
cp -R style "$staging_dir/style"
mkdir "$staging_dir/assets"
cp assets/*.webp "$staging_dir/assets/"
cp index.html "$staging_dir/index.html"
node scripts/build-styles.mjs "$staging_dir"

rm -rf -- "$project_dir/build"
mv "$staging_dir" "$project_dir/build"
trap - EXIT

echo "Release built at $project_dir/build"
