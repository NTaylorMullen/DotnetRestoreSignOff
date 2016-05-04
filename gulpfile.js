'use strict';

var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	extend = require('extend'),
	rimraf = require('rimraf'),
	gulp = require('gulp');

function createProjects(name, dependencies, frameworkSets, imports, tools) {
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

		var dest = path.join(dir, "project.json");
		// this is what will be actually written to project.json
		var project = {
			dependencies: {},
			tools: {}
		};

		if (fs.existsSync(dest)) {
			// when createProject is called multiple times. e.g. see 'ef' task
			project = JSON.parse(fs.readFileSync(dest));
		}

		extend(true, project, projectBase);
		extend(true, project.dependencies, dependencies);

		if (tools) {
			extend(true, project.tools, tools);
		}

		fs.writeFileSync(dest, JSON.stringify(project, null, 2));
	}
}

gulp.task('clean', function(done) {
	rimraf('artifacts', done);
});

gulp.task('di', ['clean'], function() {
	var frameworks = [
		["netstandard1.0"],
		["netstandard1.1"],
		["netstandard1.2"],
		["netstandard1.3"],
		["netstandard1.4"],
		["netstandard1.5"],
		["netcore50"],
		["netstandard1.0", "netstandard1.1", "netstandard1.2", "netstandard1.3", "netstandard1.4", "netstandard1.5", "netcore50"]
	];

	var deps = {
		"Microsoft.Extensions.DependencyInjection.Abstractions": "1.0.0-*"
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

gulp.task('ef', ['clean'], function() {
	var frameworks = [
		["net451"],
		["net46"],
		["net462"],
		["netcoreapp1.0"],
		["netstandard1.3"],
		["netstandard1.4"],
		["netstandard1.5"],
		["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
	];
	var deps = {
		"Microsoft.EntityFrameworkCore.Sqlite": "1.0.0-*",
		"Microsoft.EntityFrameworkCore.SqlServer": "1.0.0-*",
	};
	var imports = ["portable-net451+win8"];
	createProjects('ef', deps, frameworks, imports);

	var toolsFrameworks = [
		["net451"],
		["net46"],
		["net462"],
		["netcore50"],
		["netcoreapp1.0"]
	];
	var toolsDeps = {
		"Microsoft.EntityFrameworkCore.Tools": {
			"type": "build",
			"version": "1.0.0-*"
		}
	};
	var tools = {
		"Microsoft.EntityFrameworkCore.Tools": {
			"imports": "portable-net451+win8",
			"version": "1.0.0-*"
		}
	};
	createProjects('ef', toolsDeps, toolsFrameworks, imports, tools);
});

gulp.task('default', ['di', 'mvc', 'ef']);