'use strict';

var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	extend = require('extend'),
	rimraf = require('rimraf'),
	gulp = require('gulp'),
	Guid = require('guid');

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
		var folderName = name + '-' + tfms.reduce((all, sum) => all + "." + sum);

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
		makeXproj(dest);
	}
	writeSolution(solution, 'artifacts/all-gen.sln');
}

var solution = {
	projects: {}
};

var xprojTemplate = fs.readFileSync('./xproj.txt').toString();

function makeXproj(projectPath) {
	var dirname = path.basename(path.dirname(projectPath));
	var projectPath = path.join(path.dirname(projectPath), dirname + '.xproj');
	var g = Guid.raw().toUpperCase();
	fs.writeFileSync(
		projectPath,
		xprojTemplate.replace('$guid', g));

	solution.projects[dirname] = { name: dirname, path: path.resolve(projectPath), guid: g };
}

function writeSolution(solution, path) {
	var sln = `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio 14
VisualStudioVersion = 14.0.25123.0
MinimumVisualStudioVersion = 10.0.40219.1
`;
	for (let p in solution.projects) {
		let proj = solution.projects[p];
		sln += `
Project("{8BB2217D-0F2D-49D1-97BC-3654ED321F3B}") = "${proj.name}", "${proj.path}", "{${proj.guid}}"
EndProject`
	}

	sln += `
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution`;

	for (let p in solution.projects) {
		let proj = solution.projects[p];
		sln += `
		{${proj.guid}}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{${proj.guid}}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{${proj.guid}}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{${proj.guid}}.Release|Any CPU.Build.0 = Release|Any CPU`;
	}

	sln += `
	EndGlobalSection
EndGlobal`;

	fs.writeFile(path, sln);
}

gulp.task('clean', function (done) {
	rimraf('artifacts', done);
});

gulp.task('di', ['clean'], function () {
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

gulp.task('mvc', ['clean'], function () {
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

gulp.task('ef', ['clean'], function () {
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