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
		deps: { "Microsoft.Extensions.DependencyInjection": "1.0.0-*" },
		imports: []
	},
	{
		deps: { "Microsoft.AspNetCore.Mvc": "1.0.0-*" },
		imports: ["portable-dnxcore50+net45+win8+wp8+wpa81"]
	}
];

var frameworkSets = [
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

for (let tfms of frameworkSets) {
	// copy the base obj
	var projectBase = {};

	// clone object syntax: extend(bool: deepCopy, obj: target, obj: source)
	extend(true, projectBase, base);

	for (let f of tfms) {
		projectBase.frameworks[f] = {};
	}

	// js version of string.Join('.', tfms)
	var folderName = tfms.reduce((all, sum) => all + "." + sum);

	for (let pkgSet of packageSets) {
		var firstPackageName = Object.keys(pkgSet.deps)[0];

		if (ignore[firstPackageName] && ignore[firstPackageName].indexOf(folderName) >= 0) {
			continue;
		}

		// make aritfact dir
		var dir = path.join("artifacts", firstPackageName, folderName);
		mkdirp.sync(dir);

		// this is what will be actually written to project.json
		var project = {};
		extend(true, project, projectBase);

		for (let pkg in pkgSet.deps) {
			// add dependencies at top level
			project.dependencies[pkg] = pkgSet.deps[pkg];
		}

		if (pkgSet.imports) {
			// add imports to all tfms 
			for(let x in project.frameworks) {
				project.frameworks[x].imports = pkgSet.imports;
			}
		}

		fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 2));
	}
}