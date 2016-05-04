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

var frameworks = [
	["net451"],
	["net46"],
	["net462"],
	["netcoreapp1.0"],
	["netstandard1.5"],
	["netcore50"],
	["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
];

for (let f of frameworks) {
	// copy the base obj
	var project = {};

	// extend(deepCopy, target, source)
	extend(true, project, base);

	for (let tfm of f) {
		project.frameworks[tfm] = {};
	}
	var folderName = f.reduce((all,sum) => all +"." + sum);

	var dir = path.join("artifacts/di", folderName);
	mkdirp.sync(dir);

	fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 2));
}