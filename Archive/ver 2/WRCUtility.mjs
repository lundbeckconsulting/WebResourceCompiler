/*
    @Author     Stein Lundbeck
    @Date        11.08.2021
    @Version    2.0
*/

import img from "compress-images"; // https://github.com/Yuriy-Svetlov/compress-images
import ugly from "uglifycss";
import map from "generate-source-map";
import sass from "sass";
import config from ".//WRCConfig.json";
import path from "path";
import fs from "fs";
const defaultConfig = config.default;

const ResourceTypes = {
    STYLE: "style",
    SCRIPT: "script",
    IMAGE: "image"
};

const getTimestamp = () => {
	let dt = new Date();
	let hour = dt.getHours(), min = dt.getMinutes(), sec = dt.getSeconds(), milli = dt.getMilliseconds();

	if (hour.toString().length === 1) {
		hour = "0" + hour.toString();
	}

	if (min.toString().length === 1) {
		min = "0" + min.toString();
	}

	if (sec.toString().length === 1) {
		sec = "0" + sec.toString();
	}

	if (milli.toString().length > 2) {
		milli = milli.toString().substring(0, 2);
	}

	return `${dt.toDateString()} ${hour}:${min}:${sec}.${milli}`;
};

const removeSourceMapRef = (content) => {
	let result = content;
	let val = "//# sourceMappingUrl";

	if (content.indexOf(val) > 0) {
		result = content.substring(0, content.indexOf(val));
	}

	return result;
};

const getProject = (target) => {
	const processPath = (basePath, path) => path.replace("<base>", basePath);
	const processBundlePath = (trgt, path) => path.replace("<name>", trgt.name.replace(" ", ""));

	const getImageTypesString = () => {
		let result = "";
		let types = [];

		if (target.hasOwnProperty("imageTypes")) {
			for (let type of target.imageTypes) {
				types.push(type);
			}
		}
		else {
			for (let type of defaultConfig.imageTypes) {
				types.push(type);
			}
		}

		for (let i = 0; i < types.length; i++) {
			let type = types[i];

			result = result + type + "," + type.toUpperCase();

			if (i < types.length - 1) {
				result = result + ",";
			}
		}

		return result;
	};

	let stylePath = target.stylePath ? processPath(target.basePath, target.stylePath) : processPath(target.basePath, defaultConfig.stylePath), styleOutPath = target.styleOutPath ? processPath(target.basePath, target.styleOutPath) : processPath(target.basePath, defaultConfig.styleOutPath), styleBundlePath = target.styleBundlePath ? processBundlePath(target, processPath(target.basePath, target.styleBundlePath)) : processBundlePath(target, processPath(target.basePath, defaultConfig.styleBundlePath));
	let scriptPath = target.scriptPath ? processPath(target.basePath, target.scriptPath) : processPath(target.basePath, defaultConfig.scriptPath), scriptOutPath = target.scriptOutPath ? processPath(target.basePath, target.scriptOutPath) : processPath(target.basePath, defaultConfig.scriptOutPath), scriptBundlePath = target.scriptBundlePath ? processBundlePath(target, processPath(target.basePath, target.scriptBundlePath)) : processBundlePath(target, processPath(target.basePath, defaultConfig.scriptBundlePath));
	let imagePaths = [];
	let reCompile = target.hasOwnProperty("reCompile") ? target.reCompile : defaultConfig.reCompile;
	let processStyle = target.hasOwnProperty("processStyle") ? target.processStyle : defaultConfig.processStyle;
	let processScript = target.hasOwnProperty("processScript") ? target.processScript : defaultConfig.processScript;
	let bundleStyle = target.hasOwnProperty("bundleStyle") ? target.bundleStyle : defaultConfig.bundleStyle;
	let bundleScript = target.hasOwnProperty("bundleScript") ? target.bundleScript : defaultConfig.bundleScript;
	let minimizeStyle = target.hasOwnProperty("styleMinimize") ? target.styleMinimize : defaultConfig.styleMinimize;
	let minimizeScript = target.hasOwnProperty("scriptMinimize") ? target.scriptMinimize : defaultConfig.scriptMinimize;
	let minimizeImage = target.hasOwnProperty("imageMinimize") ? target.imageMinimize : defaultConfig.imageMinimize;

	if (target.imagePaths) {
		for (let img of target.imagePaths) {
			let tmp = img.split('>');
			let itm = {
				"from": img[0].trim(),
				"to": img[1].trim()
			};

			imagePaths.push(itm);
		}
	}

	log("beta", getImageTypesString());

	return {
		"name": target.name,
		"base": target.basePath,
		"style": stylePath,
		"styleOut": styleOutPath,
		"styleBundle": styleBundlePath,
		"script": scriptPath,
		"scriptOut": scriptOutPath,
		"scriptBundle": scriptBundlePath,
		"reCompile": reCompile,
		"processStyle": processStyle,
		"processScript": processScript,
		"bundleStyle": bundleStyle,
		"bundleScript": bundleScript,
		"images": imagePaths,
		"minimizeStyle": minimizeStyle,
		"minimiizeScript": minimizeScript,
		"minimizeImage": minimizeImage,
		"imageTypes": getImageTypesString()
	};
};

const getFileName = (path) => basename(path);

const getSourceMappingStr = (name) => `\n\n\t//# sourceMappingUrl=${name}`;

const log = (cmd, txt) => console.log(`${getTimestamp()}    -- ${cmd} / ${txt}`);

const logError = (cmd, error, throw_ = false) => {
    log(cmd, "An error occured");

    console.error(error);

    if (throw_) {
        throw error;
    }
};

const handleStyle = (target, filename) => {
	if (styleMinimize) {
		log("Sass to CSS", "Processing " + filename);

		if (uglifyStyle) {

		}
	}
};

const handleScript = (target, filename) => {
	if (scriptMinimize) {
		log("JavaScript", "Processing " + filename);
	}
};

const handleImage = (target, filename) => {
	if (imageMinimize) {
		log("Image compression", "Processing " + filename);
	}
};

const handleReCompile = (target, callback) => {
	if (imageMinimize) {
		const cantReadPath = (path) => "Can't read path " + path;

		log("ReCompile", "Processing Sass files");
		readdir(target.style, { withFileTypes: true }, (err, files) => {
			if (err) {
				logError("ReCompile", cantReadPath(target.style));
			}
			else {
				files.forEach(file => {
					handleStyle(target, file);
				});
			}
		});

		log("ReCompile", "Processing Scripts");
		readdir(target.script, { withFileTypes: true }, (err, files) => {
			if (err) {
				logError("ReCompile", cantReadPath(target.script));
			}
			else {
				files.forEach(file => {
					handleScript(target, file);
				});
			}
		});

		log("ReCompile", "Processing Images");
		for (let tmp of target.images) {
			readdir(tmp.from, { withFileTypes: true }, (err, files) => {
				if (err) {
					logError("ReCompile", cantReadPath(tmp.from));
				}
				else {
					let error = false;
					let tmpDir = readdir(tmp.to, { withFileTypes: true }, (flsErr, fls) => {
						if (flsErr) {
							error = true;
						}
					});

					if (error) {
						logError("Compress image", cantReadPath(tmp.to));
					}
					else {
						files.forEach(file => {
							handleImage(target, file);
						});
					}
				}
			});
		}
	}

	if (!callback) {
		callback();
	}
};

export default {
	handleStyle,
	handleScript,
	handleImage,
	handleReCompile,
	log,
	logError,
	getProject
};
