'use strict';

var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	extend = require('extend'),
	rimraf = require('rimraf'),
	gulp = require('gulp'),
	Guid = require('guid');

function createProjects(name, dependencies, frameworkSets, imports, tools, frameworkDependencies, runtimes) {
	for (let tfms of frameworkSets) {
		// shared
		var projectBase = {
			frameworks: {}
		};

		for (let f of tfms) {
			var specificDependencies = {};
			
			if (frameworkDependencies)
			{
				specificDependencies = frameworkDependencies[f];
			}
			
			projectBase.frameworks[f] = {
				imports: imports,
				dependencies: specificDependencies
			};
		}

		// js version of string.Join('.', tfms)
		var folderName = name + '-' + tfms.reduce((all, sum) => all + "." + sum).substring(0, 20);

		// make aritfact dir
		var dir = path.join("artifacts", name, folderName);
		mkdirp.sync(dir);

		var dest = path.join(dir, "project.json");
		// this is what will be actually written to project.json
		var project = {
			dependencies: {},
			tools: {}
		};
		
		if (runtimes)
		{
			project.runtimes = runtimes;
		}

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

gulp.task('di-portable-app', ['clean'], function () {
	var frameworks = [
		["netcoreapp1.0"],
		// ["netstandard1.0"],
		// ["netstandard1.1"],
		// ["netstandard1.2"],
		// ["netstandard1.3"],
		// ["netstandard1.4"],
		["netstandard1.5"],
		["netcore50"],
		// ["netstandard1.0", "netstandard1.1", "netstandard1.2", "netstandard1.3", "netstandard1.4", "netstandard1.5", "netcore50"]
		["netstandard1.5", "netcoreapp1.0"]
	];

	var deps = {
		"Microsoft.Extensions.DependencyInjection.Abstractions": "1.0.0-*",
		"Microsoft.NETCore.App": {
			"type": "platform",
			"version": "1.0.0-*"
		}
	};
	createProjects('di-portable-app', deps, frameworks);
});

gulp.task('di-standalone-app', ['clean'], function () {
	var frameworks = [
		["netcoreapp1.0"],
		// ["netstandard1.0"],
		// ["netstandard1.1"],
		// ["netstandard1.2"],
		// ["netstandard1.3"],
		// ["netstandard1.4"],
		["netstandard1.5"],
		["netcore50"],
		// ["netstandard1.0", "netstandard1.1", "netstandard1.2", "netstandard1.3", "netstandard1.4", "netstandard1.5", "netcore50"]
		["netstandard1.5", "netcoreapp1.0"]
	];

	var deps = {
		"Microsoft.Extensions.DependencyInjection.Abstractions": "1.0.0-*",
		"Microsoft.NETCore.App": {
			"version": "1.0.0-*"
		}
	};
	var runtimes = {
		"win7-x64": {},
		"win7-x86": {},
		"ubuntu.14.04-x64": {}
	};
	createProjects('di-standalone-app', deps, frameworks, null, null, null, runtimes);
});

gulp.task('di-library', ['clean'], function () {
	var frameworks = [
		["netstandard1.0"],
		["netstandard1.1"],
		["netstandard1.2"],
		["netstandard1.3"],
		["netstandard1.4"],
		["netstandard1.5"],
		["netcore50"],
		["netstandard1.0", "netstandard1.1", "netstandard1.2", "netstandard1.3", "netstandard1.4", "netstandard1.5", "netcore50"],
		["netstandard1.5", "netcore50", "netcoreapp1.0"]
	];

	var deps = {
		"Microsoft.Extensions.DependencyInjection.Abstractions": "1.0.0-*",
		"NETStandard.Library": "1.5.0-*"
	};
	createProjects('di-library', deps, frameworks);
});

// gulp.task('mvc-portable-app', ['clean'], function () {
// 	var frameworks = [
// 		["net451"],
// 		["net46"],
// 		["net462"],
// 		["netcoreapp1.0"],
// 		["netstandard1.5"],
// 		["net451", "net462", "netcoreapp1.0", "netstandard1.5"],
// 		["net451", "netcoreapp1.0", "netstandard1.5"]
// 	];
// 	var frameworkDependencies = {
// 		"netcoreapp1.0": {
// 			"Microsoft.NETCore.App": {
// 				"type": "platform",
// 				"version": "1.0.0-*"
// 			}
// 		},
// 		"netstandard1.5": {
// 			"Microsoft.NETCore.App": {
// 				"type": "platform",
// 				"version": "1.0.0-*"
// 			}
// 		}
// 	}
// 	var deps = {
// 		"Microsoft.AspNetCore.Mvc": "1.0.0-*",
// 	};
// 	var imports = ["portable-dnxcore50+net45+win8+wp8+wpa81"];
// 	createProjects('mvc-portable-app', deps, frameworks, imports, null, frameworkDependencies);
// });

// gulp.task('mvc-standalone-app-xplat', ['clean'], function () {
// 	var frameworks = [
// 		["netcoreapp1.0"],
// 		["netstandard1.5"],
// 		["netcoreapp1.0", "netstandard1.5"]
// 	];
// 	var frameworkDependencies = {
// 		"netcoreapp1.0": {
// 			"Microsoft.NETCore.App": {
// 				"version": "1.0.0-*"
// 			}
// 		},
// 		"netstandard1.5": {
// 			"Microsoft.NETCore.App": {
// 				"version": "1.0.0-*"
// 			}
// 		}
// 	}
// 	var deps = {
// 		"Microsoft.AspNetCore.Mvc": "1.0.0-*",
// 	};
// 	var runtimes = {
// 		"win7-x64": {},
// 		"win7-x86": {},
// 		"ubuntu.14.04-x64": {}
// 	};
// 	var imports = ["portable-dnxcore50+net45+win8+wp8+wpa81"];
// 	createProjects('mvc-standalone-app-xplat', deps, frameworks, imports, null, frameworkDependencies, runtimes);
// });

// gulp.task('mvc-standalone-app-win', ['clean'], function () {
// 	var frameworks = [
// 		["net451"],
// 		["net46"],
// 		["net462"],
// 		["netcoreapp1.0"],
// 		["netstandard1.5"],
// 		["net451", "net462", "netcoreapp1.0", "netstandard1.5"],
// 		["net451", "netcoreapp1.0", "netstandard1.5"]
// 	];
// 	var frameworkDependencies = {
// 		"netcoreapp1.0": {
// 			"Microsoft.NETCore.App": {
// 				"version": "1.0.0-*"
// 			}
// 		},
// 		"netstandard1.5": {
// 			"Microsoft.NETCore.App": {
// 				"version": "1.0.0-*"
// 			}
// 		}
// 	}
// 	var deps = {
// 		"Microsoft.AspNetCore.Mvc": "1.0.0-*",
// 	};
// 	var runtimes = {
// 		"win7-x64": {},
// 		"win7-x86": {}
// 	};
// 	var imports = ["portable-dnxcore50+net45+win8+wp8+wpa81"];
// 	createProjects('mvc-standalone-app-win', deps, frameworks, imports, null, frameworkDependencies, runtimes);
// });

// gulp.task('mvc-library', ['clean'], function () {
// 	var frameworks = [
// 		["net451"],
// 		["net46"],
// 		["net462"],
// 		["netcoreapp1.0"],
// 		["netstandard1.5"],
// 		["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
// 	];
// 	var frameworkDependencies = {
// 		"netcoreapp1.0": {
// 			"NETStandard.Library": "1.5.0-*"
// 		},
// 		"netstandard1.5": {
// 			"NETStandard.Library": "1.5.0-*"
// 		}
// 	}
// 	var deps = {
// 		"Microsoft.AspNetCore.Mvc": "1.0.0-*",
// 	};
// 	var imports = ["portable-dnxcore50+net45+win8+wp8+wpa81"];
// 	createProjects('mvc-library', deps, frameworks, imports, null, frameworkDependencies);
// });

// gulp.task('mvc-portable', ['clean'], function () {
// 	var frameworks = [
// 		// ["net451"],
// 		// ["net46"],
// 		// ["net462"],
// 		["netcoreapp1.0"],
// 		["netstandard1.5"],
// 		["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
// 	];
// 	var deps = {
// 		"Microsoft.AspNetCore.Mvc": "1.0.0-*",
// 		"Microsoft.NETCore.App": {
//           "type": "platform",
//           "version": "1.0.0-*"
//         }
// 	};
// 	var imports = ["portable-dnxcore50+net45+win8+wp8+wpa81"];
// 	createProjects('mvc', deps, frameworks, imports);
// });

// gulp.task('ef', ['clean'], function () {
// 	var frameworks = [
// 		["net451"],
// 		["net46"],
// 		["net462"],
// 		["netcoreapp1.0"],
// 		["netstandard1.3"],
// 		["netstandard1.4"],
// 		["netstandard1.5"],
// 		["net451", "net462", "netcoreapp1.0", "netstandard1.5"]
// 	];
// 	var deps = {
// 		"Microsoft.EntityFrameworkCore.Sqlite": "1.0.0-*",
// 		"Microsoft.EntityFrameworkCore.SqlServer": "1.0.0-*",
// 	};
// 	var imports = ["portable-net451+win8"];
// 	createProjects('ef', deps, frameworks, imports);

// 	var toolsFrameworks = [
// 		["net451"],
// 		["net46"],
// 		["net462"],
// 		["netcore50"],
// 		["netcoreapp1.0"]
// 	];
// 	var toolsDeps = {
// 		"Microsoft.EntityFrameworkCore.Tools": {
// 			"type": "build",
// 			"version": "1.0.0-*"
// 		}
// 	};
// 	var tools = {
// 		"Microsoft.EntityFrameworkCore.Tools": {
// 			"imports": "portable-net451+win8",
// 			"version": "1.0.0-*"
// 		}
// 	};
// 	createProjects('ef', toolsDeps, toolsFrameworks, imports, tools);
// });

// gulp.task('default', ['di', 'mvc', 'ef']);
gulp.task('default', ['di-portable-app', 'di-standalone-app', 'di-library']);