const config = require(".//WRCConfig");
const pathRepo = require("path");
const options = config.default;

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
	let stylePath = target.stylePath ? processPath(target.basePath, target.stylePath) : processPath(target.basePath, options.stylePath), styleOutPath = target.styleOutPath ? processPath(target.basePath, target.styleOutPath) : processPath(target.basePath, options.styleOutPath), styleBundlePath = target.styleBundlePath ? processBundlePath(target, processPath(target.basePath, target.styleBundlePath)) : processBundlePath(target, processPath(target.basePath, options.styleBundlePath));
	let scriptPath = target.scriptPath ? processPath(target.basePath, target.scriptPath) : processPath(target.basePath, options.scriptPath), scriptOutPath = target.scriptOutPath ? processPath(target.basePath, target.scriptOutPath) : processPath(target.basePath, options.scriptOutPath), scriptBundlePath = target.scriptBundlePath ? processBundlePath(target, processPath(target.basePath, target.scriptBundlePath)) : processBundlePath(target, processPath(target.basePath, options.scriptBundlePath));
	let imagePath = target.imagePath ? processPath(target.basePath, target.imagePath) : processPath(target.basePath, options.imagePath);
	let reCompile = target.hasOwnProperty("reCompile") ? target.reCompile : options.reCompile;
	let processStyle = target.hasOwnProperty("processStyle") ? target.processStyle : options.processStyle;
	let processScript = target.hasOwnProperty("processScript") ? target.processScript : options.processScript;
	let bundleStyle = target.hasOwnProperty("bundleStyle") ? target.bundleStyle : options.bundleStyle;
	let bundleScript = target.hasOwnProperty("bundleScript") ? target.bundleScript : options.bundleScript;

	return {
		"name": target.name,
		"base": target.basePath,
		"style": stylePath,
		"styleOut": styleOutPath,
		"styleBundle": styleBundlePath,
		"script": scriptPath,
		"scriptOut": scriptOutPath,
		"scriptBundle": scriptBundlePath,
		"image": imagePath,
		"reCompile": reCompile,
		"processStyle": processStyle,
		"processScript": processScript,
		"bundleStyle": bundleStyle,
		"bundleScript": bundleScript
	};
};

const getFileName = (path) => pathRepo.basename(path);

const getSourceMappingStr = (name) => `\n\n\t//# sourceMappingUrl=${name}`;

const log = (cmd, txt) => console.log(`${getTimestamp()}    -- ${cmd} / ${txt}`);

const logError = (cmd, error, throw_ = false) => {
    util.log(cmd, "An error occured");

    console.error(error);

    if (throw_) {
        throw error;
    }
};

const removeSourceMapRef = (content) => {
    let result = content;
    let val = "//# sourceMappingUrl";

    if (content.indexOf(val) > 0) {
        result = content.substring(0, content.indexOf(val));
    }

    return result;
};

module.exports = {
	getTimestamp,
	removeSourceMapRef,
	getProject,	
	getFileName,
	getSourceMappingStr,
	log,
	logError,
	removeSourceMapRef,
	ResourceTypes
}
