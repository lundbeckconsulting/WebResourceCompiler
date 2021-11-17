const config = require(".//WRCConfig");
const util = require(".//WRCUtility");
const imgCompress = require("compress-images") // https://www.npmjs.com/package/compress-images
const sassRepo = require("node-sass");
const cssUgly = require("uglifycss");
const srcMap = require("generate-source-map");
const fileSys = require("fs");
const watcher = require("node-watch");

const handleStyle = (target, project) => {

};

const handleScript = (target, project) => {

};

const handleImage = (target, project) => {

};

const handleReCompile = (type, project) => {

};

const watchProject = (project) => {

};

module.exports = {
	handleStyle,
	handleScript,
	handleImage,
	handleReCompile,
	watchProject
}
