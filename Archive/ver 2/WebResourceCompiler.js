/*
    @Author     Stein Lundbeck
    @Date        27.07.2021
    @Version    2.0.3
*/

const fs = require("fs");
const pth = require("path");
const sass = require("node-sass");
const css = require("uglifycss");
const smap = require("generate-source-map");
const babel = require("@babel/core");
const watch = require("node-watch");
const config = require(".//WebResourceCompilerConfig");
const options = config.default;
const processBundlePath = (project, path) => path.replace("<name>", project.name.replace(" ", ""));
var _targetFilename = null;

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

const getFilename = (path) => pth.basename(path);
const getSourceMapping = (name) => `\n\n\t//# sourceMappingUrl=${name}`;
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

const finished = (filename) => {
    let txt = filename;

    if (_targetFilename !== null && _targetFilename.length > 0) {
        txt += ` => ${_targetFilename}`;
    }

    log("Finished", `File => ${txt}`);

    _targetFilename = null;
};

const handleFile = (type, project, source) => {
    let outFile = (type === "style" ? project.styleOut : project.scriptOut) + "//" + source.outFilename;
    let outMinFile = outFile.replace(type === "style" ? ".css" : ".js", type === "style" ? ".min.css" : ".min.js");
    let outMap = `${outFile}.map`;
    let outMinMap = `${outMinFile}.map`;

    _targetFilename = source.outFilename;
};

const handleBundle = (type, project) => {


};

const getProject = (project) => {
    const processPath = (basePath, path) => path.replace("<base>", basePath);
    let stylePath = project.stylePath ? processPath(project.basePath, project.stylePath) : processPath(project.basePath, options.stylePath), styleOutPath = project.styleOutPath ? processPath(project.basePath, project.styleOutPath) : processPath(project.basePath, options.styleOutPath), styleBundlePath = project.styleBundlePath ? processBundlePath(project, processPath(project.basePath, project.styleBundlePath)) : processBundlePath(project, processPath(project.basePath, options.styleBundlePath));
    let scriptPath = project.scriptPath ? processPath(project.basePath, project.scriptPath) : processPath(project.basePath, options.scriptPath), scriptOutPath = project.scriptOutPath ? processPath(project.basePath, project.scriptOutPath) : processPath(project.basePath, options.scriptOutPath), scriptBundlePath = project.scriptBundlePath ? processBundlePath(project, processPath(project.basePath, project.scriptBundlePath)) : processBundlePath(project, processPath(project.basePath, options.scriptBundlePath));
    let reCompile = project.hasOwnProperty("reCompile") ? project.reCompile : options.reCompile;
    let processStyle = project.hasOwnProperty("processStyle") ? project.processStyle : options.processStyle;
    let processScript = project.hasOwnProperty("processScript") ? project.processScript : options.processScript;
    let bundleStyle = project.hasOwnProperty("bundleStyle") ? project.bundleStyle : options.bundleStyle;
    let bundleScript = project.hasOwnProperty("bundleScript") ? project.bundleScript : options.bundleScript;

    return { "name": project.name, "base": project.basePath, "style": stylePath, "styleOut": styleOutPath, "styleBundle": styleBundlePath, "script": scriptPath, "scriptOut": scriptOutPath, "scriptBundle": scriptBundlePath, "reCompile": reCompile, "processStyle": processStyle, "processScript": processScript, "bundleStyle": bundleStyle, "bundleScript": bundleScript };
};

const getFolder = (type, path, includeAllFiles = false) => {
    let result = [];

    fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
        if (!file.isDirectory()) {
            addFile(file, path, createFilename(file, path, true, type === "style" ? ".css" : ".js"));
        }
        else {
            fetchFolder(`${path}//${file.name}`);
        }

        function fetchFolder(folderPath) {
            fs.readdirSync(folderPath, { withFileTypes: true }).forEach((fil) => {
                if (!fil.isDirectory()) {
                    addFile(fil, folderPath, createFilename(fil, folderPath, false, type === "style" ? ".css" :  ".js"));
                }
                else {
                    fetchFolder(`${folderPath}//${fil.name}`);
                }
            });
        }
    });

    function createFilename(file, folder, isBase = false, extension = null) {
        let filename = folder.replace(path, "");
        filename = filename.substring(2);

        if (!isBase) {
            filename += `//${file.name}`;
        }
        else {
            filename = file.name;
        }

        filename = filename.replace(/(\/\/)/gm, ".");

        if (extension) {
            let ext = type === "style" ? ".scss" : ".js";
            filename = `${filename.substring(0, filename.lastIndexOf(ext))}${extension}`;
        }

        return filename;
    };

    function addFile(file, folderPath, outFilename = null) {
        let add = false;

        if (!outFilename) {
            outFilename = file.name;
        }

        if (includeAllFiles) {
            add = true;
        }
        else {
            if (!file.name.endsWith(".map")) {
                if (type === "style") {
                    if (!file.name.startsWith("_")) {
                        add = true;
                    }
                }
                else if (type === "script") {
                    add = true;
                }
            }
        }

        if (add) {
            result.push({ "file": file, "path": folderPath, "source": `${folderPath}//${file.name}`, "outFilename": outFilename });
        }
    };

    return result;
};

const load = () => {
    log("Loading", `Web Resource Compiler => ${config.projects.length} projects`);

    const watchFolder = (type, project) => {
        let filter = null, watchPath = null;

        if (type === "style") {
            filter = /\.scss$/;
            watchPath = project.style;
        }
        else if (type === "script") {
            filter = /\.js$/;
            watchPath = project.script;
        }

        try {
            watch(watchPath, { recursive: true, filter: filter }, (evt, name) => {
                if (!getFilename(name).startsWith("_") && evt === "update") {
                    log("Changed", `${project.name} => ${getFilename(".//" + name)}`);

                    let tmpFiles = getFolder(type, type === "style" ? project.style : project.script);
                    let tmp = `.//${name}`.replace(/\\/gm, "//");
                    tmp = tmp.substring(type === "style" ? project.style.length : project.script.length + 2);

                    if (tmp.startsWith("//")) {
                        tmp = tmp.substring(2);
                    }

                    tmp = tmp.replace(/(\/\/)/gm, ".");

                    if (type === "style") {
                        tmp = tmp.replace(".scss", ".css");
                    }

                    let file = tmpFiles.find((item) => {
                        return item.outFilename === tmp;
                    });

                    if (file) {
                        handleFile(type, project, file);

                        if (type === "script" && project.bundleScript) {
                            handleBundle(type, project);;
                        }

                        if (type === "style" && project.bundleStyle) {
                            handleBundle(type, project);
                        }

                        finished(getFilename(file.source));
                    }
                    else {
                        logError("Not found", new Error(`File ${getFilename(`.//${getFilename(name)} not found`)}`));
                    }
                }
            });
        } catch (error) {
            logError("Watching", error);
        }
    };

    const reCompile = (project) => {
        log("ReCompile", `Project => ${project.name}`);

        let styleFiles = getFolder("style", project.style), scriptFiles = getFolder("script", project.script);

        styleFiles.forEach((file) => {
            handleFile("style", project, file);
        });

        if (project.bundleStyle) {
            handleBundle("style", project);
        }

        scriptFiles.forEach((file) => {
            handleFile("script", project, file);
        });

        if (project.bundleScript) {
            handleBundle("script", project);
        }

        log("Processed", `${project.name} => ${styleFiles.length.toString()} style & ${scriptFiles.length.toString()} script files`);
    };

    for (const item of config.projects) {
        if (item.name) {
            if (item.basePath) {
                let project = getProject(item);

                if (project.reCompile) {
                    reCompile(project);
                }

                watchFolder("style", project);
                watchFolder("script", project);

                log("Watching", `Project => ${project.name}`);
            }
            else {
                logError("Loading", new Error(`${item.name} => Project missing parameter "basePath"`));
            }
        }
        else {
            logError("Loading", new Error(`Index ${i.toString()} => Project missing parameter "name"`));
        }
    }
};

load();
