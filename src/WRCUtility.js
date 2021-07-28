const config = require(".//WRCConfig");
const pth = require("path");
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

const getProject = (project) => {
	const processPath = (basePath, path) => path.replace("<base>", basePath);
	let stylePath = project.stylePath ? processPath(project.basePath, project.stylePath) : processPath(project.basePath, options.stylePath), styleOutPath = project.styleOutPath ? processPath(project.basePath, project.styleOutPath) : processPath(project.basePath, options.styleOutPath), styleBundlePath = project.styleBundlePath ? processBundlePath(project, processPath(project.basePath, project.styleBundlePath)) : processBundlePath(project, processPath(project.basePath, options.styleBundlePath));
	let scriptPath = project.scriptPath ? processPath(project.basePath, project.scriptPath) : processPath(project.basePath, options.scriptPath), scriptOutPath = project.scriptOutPath ? processPath(project.basePath, project.scriptOutPath) : processPath(project.basePath, options.scriptOutPath), scriptBundlePath = project.scriptBundlePath ? processBundlePath(project, processPath(project.basePath, project.scriptBundlePath)) : processBundlePath(project, processPath(project.basePath, options.scriptBundlePath));
	let imagePath = project.imagePath ? processPath(project.basePath, project.imagePath) : processPath(project.basePath, options.imagePath);
	let reCompile = project.hasOwnProperty("reCompile") ? project.reCompile : options.reCompile;
	let processStyle = project.hasOwnProperty("processStyle") ? project.processStyle : options.processStyle;
	let processScript = project.hasOwnProperty("processScript") ? project.processScript : options.processScript;
	let bundleStyle = project.hasOwnProperty("bundleStyle") ? project.bundleStyle : options.bundleStyle;
	let bundleScript = project.hasOwnProperty("bundleScript") ? project.bundleScript : options.bundleScript;

	return {
		"name": project.name,
		"base": project.basePath,
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

const getFileName = (path) => pth.basename(path);

const getSourceMappingStr = (name) => `\n\n\t//# sourceMappingUrl=${name}`;

const log = (cmd, txt) => console.log(`${getTimestamp()}    -- ${cmd} / ${txt}`);

const logError = (cmd, error, throw_ = false) => {
    log(cmd, "An error occured");

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
