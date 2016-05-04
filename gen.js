'use strict';
var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	extend = require('extend');

var base = {
	"dependencies": {

	},
	"frameworks": {

	}
};

var tfms = ["netstandard1.1", "netstandard1.2", "netstandard1.3"];

for (let tfm of tfms) {
	// copy the base obj
	var project = {};
	
	// extend(deepCopy, target, source)
	extend(true, project, base);

    project.frameworks[tfm] = {};

	var dir = path.join("artifacts/mvc",tfm);
	mkdirp.sync(dir);

	fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 2));
}