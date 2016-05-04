'use strict';

var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	extend = require('extend'),
	rimraf = require('rimraf'),
	gulp = require('gulp');

function createProjects(name, dependencies, frameworkSets, imports) {
	for (let tfms of frameworkSets) {
		// shared
		var projectBase = {
			frameworks: {}
		};

		for (let f of tfms) {
			projectBase.frameworks[f] = {
				imports: imports
			};
		}

		// js version of string.Join('.', tfms)
		var folderName = tfms.reduce((all, sum) => all + "." + sum);

		// make aritfact dir
		var dir = path.join("artifacts", name, folderName);
		mkdirp.sync(dir);

		// this is what will be actually written to project.json
		var project = {
			dependencies: {}
		};

		extend(true, project, projectBase);
		extend(true, project.dependencies, dependencies);

		fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 2));
	}
}

gulp.task('clean', function(done) {
	rimraf('artifacts', done);
});

gulp.task('di', ['clean'], function() {
	var frameworks = [
		["net451"],
		["net46"],
		["net462"],
		["netcoreapp1.0"],
		["netstandard1.5"],
		["netcore50"],
		["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
	];
	var deps = {
		"Microsoft.Extensions.DependencyInjection": "1.0.0-*"
	};
	createProjects('di', deps, frameworks);
});

gulp.task('mvc', ['clean'], function() {
	var frameworks = [
		["net451"],
		["net46"],
		["net462"],
		["netcoreapp1.0"],
		["netstandard1.5"],
		["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
	];
	var deps = {
		"Microsoft.AspNetCore.Mvc": "1.0.0-*"
	};
	var imports = ["portable-dnxcore50+net45+win8+wp8+wpa81"];
	createProjects('mvc', deps, frameworks, imports);
});

gulp.task('default', ['di', 'mvc']);