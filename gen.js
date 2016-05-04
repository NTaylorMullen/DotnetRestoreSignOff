'use strict';
var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	extend = require('extend'),
	rimraf = require('rimraf');

rimraf.sync('artifacts/');

var base = {
	"dependencies": {

	},
	"frameworks": {

	}
};

var packageSets = [
	{
		"Microsoft.Extensions.DependencyInjection": "1.0.0-*"
	},
	{
		"Microsoft.AspNetCore.Mvc": "1.0.0-*"
	}
];

var frameworks = [
	["net451"],
	["net46"],
	["net462"],
	["netcoreapp1.0"],
	["netstandard1.5"],
	["netcore50"],
	["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
];

var ignore = {
	"Microsoft.AspNetCore.Mvc": ["netcore50"]
};

for (let f of frameworks) {
	// copy the base obj
	var projectBase = {};

	// extend(deepCopy, target, source)
	extend(true, projectBase, base);

	for (let tfm of f) {
		projectBase.frameworks[tfm] = {};
	}
	var folderName = f.reduce((all, sum) => all + "." + sum);

	for (let pkgs of packageSets) {
		var firstPackageName = Object.keys(pkgs)[0];

		if (ignore[firstPackageName] && ignore[firstPackageName].indexOf(folderName) >= 0) {
			continue;
		}

		var dir = path.join("artifacts", firstPackageName, folderName);
		mkdirp.sync(dir);

		var project = {};
		extend(true, project, projectBase);
		for (let pkg in pkgs) {
			project.dependencies[pkg] = pkgs[pkg];
		}

		fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 2));
	}
}