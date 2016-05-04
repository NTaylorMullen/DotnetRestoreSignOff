#!/usr/bin/env bash

node gen.js
dotnet="$(pwd)/.dotnet/dotnet"

version="latest"

if [ ! -e $dotnet ]; then
	curl https://raw.githubusercontent.com/dotnet/cli/rel/1.0.0/scripts/obtain/dotnet-install.sh | bash -s -- -i "$(pwd)/.dotnet" --version $version
fi

$dotnet restore --verbosity error artifacts/