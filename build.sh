#!/usr/bin/env bash

echo "Generating project.json files"
node gen.js

dotnet="$(pwd)/.dotnet/dotnet"

version="latest"

if [ ! -e $dotnet ]; then
	curl https://raw.githubusercontent.com/dotnet/cli/rel/1.0.0/scripts/obtain/dotnet-install.sh | bash -s -- -i "$(pwd)/.dotnet" --version $version
fi

echo "Running dotnet restore --verbosity error"
$dotnet restore --verbosity error artifacts/

echo "Done."