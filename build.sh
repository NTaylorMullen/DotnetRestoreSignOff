#!/usr/bin/env bash
set -e
echo "Generating project.json files"
npm start

dotnet="$(pwd)/.dotnet/dotnet"

version="latest"

if [ ! -e $dotnet ]; then
	curl https://raw.githubusercontent.com/dotnet/cli/rel/1.0.0/scripts/obtain/dotnet-install.sh | bash -s -- -i "$(pwd)/.dotnet" --version $version
fi

$dotnet --info

echo "Running dotnet restore --verbosity error"
$dotnet restore --verbosity error artifacts/
rc=$?
echo "Done. Restore exit code = $rc"