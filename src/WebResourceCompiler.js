/*
    @Author     Stein Lundbeck
    @Date        27.07.2021
    @Version    2.0.3
*/

const config = require(".//WRCConfig");
const util = require(".//WRCUtility");
const process = require("//WRCProcess")
const options = config.default;
const fs = require("fs");
const pth = require("path");
const babel = require("@babel/core");
const watch = require("node-watch");
const { hasUncaughtExceptionCaptureCallback } = require("process");
const processBundlePath = (project, path) => path.replace("<name>", project.name.replace(" ", ""));
var _targetFilename = null;

const finished = (filename) => {
    let txt = filename;

    if (_targetFilename !== null && _targetFilename.length > 0) {
        txt += ` => ${_targetFilename}`;
    }

    util.log("Finished", `File => ${txt}`);

    _targetFilename = null;
};

const handleStyle = (target, project) => {

};

const handleScript = (target, project) => {

};

const handleImage = (target, project) => {

};

const handleFile = (type, project, source) => {
    let outFile;
    let outMinFile;

    switch (type) {
        case util.ResourceTypes.STYLE:
            outFile = project.styleOut;
            break;

        case util.ResourceTypes.SCRIPT:
            outFile = project.scriptOut;
            break;

        case util.ResourceTypes.IMAGE:
            outFile = project.imagePath;
            break;
    }

    outFile += `//${source.outFilename}`;

    switch (type) {
        case util.ResourceTypes.STYLE:
            outMinFile = outFile.replace(".css", ".min.css");
            break;

        case util.ResourceTypes.SCRIPT:
            outMinFile = outFile.replace(".js", ".min.js");
            break;

        case util.ResourceTypes.IMAGE:
            let tmp = outFile.substring(outFile.lastIndexOf("."));
            outMinFile = outFile.substring(0, outFile.lastIndexOf(".")) + `.min.${tmp}`;
            break;
    }

    let outMap = `${outFile}.map`;
    let outMinMap = `${outMinFile}.map`;

    _targetFilename = source.outFilename;
};

const handleBundle = (type, project) => {

};

const getFolder = (type, path, includeAllFiles = false) => {
    let result = [];

    fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
        if (!file.isDirectory()) {
            addFile(file, path, createFilename(file, path, true, type === ResourceTypes.STYLE ? ".css" : ".js"));
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
            let ext;

            if (type === ResourceTypes.STYLE) {
                ext = ".scss";
            }
            else if (type === ResourceTypes.SCRIPT) {
                ext = ".js";
            }

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
                if (type === ResourceTypes.STYLE) {
                    if (!file.name.startsWith("_")) {
                        add = true;
                    }
                }
                else if (type === ResourceTypes.SCRIPT) {
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

        if (type === ResourceTypes.STYLE) {
            filter = /\.scss$/;
            watchPath = project.style;
        }
        else if (type === ResourceTypes.SCRIPT) {
            filter = /\.js$/;
            watchPath = project.script;
        }
        else if (type === ResourceTypes.IMAGE) {
            watchPath = project.image;
        }

        try {
            watch(watchPath, { recursive: true, filter: filter }, (evt, name) => {
                if (!getFilename(name).startsWith("_") && evt === "update") {
                    log("Changed", `${project.name} => ${getFilename(".//" + name)}`);

                    let tmpFiles = getFolder(type, type === ResourceTypes.STYLE ? project.style : project.script);
                    let tmp = `.//${name}`.replace(/\\/gm, "//");
                    tmp = tmp.substring(type === ResourceTypes.STYLE ? project.style.length : project.script.length + 2);

                    if (tmp.startsWith("//")) {
                        tmp = tmp.substring(2);
                    }

                    tmp = tmp.replace(/(\/\/)/gm, ".");

                    if (type === ResourceTypes.STYLE) {
                        tmp = tmp.replace(".scss", ".css");
                    }

                    let file = tmpFiles.find((item) => {
                        return item.outFilename === tmp;
                    });

                    if (file) {
                        handleFile(type, project, file);

                        if (type === ResourceTypes.SCRIPT && project.bundleScript) {
                            handleBundle(type, project);;
                        }

                        if (type === ResourceTypes.STYLE && project.bundleStyle) {
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
            handleFile(ResourceTypes.STYLE, project, file);
        });

        if (project.bundleStyle) {
            handleBundle(ResourceTypes.STYLE, project);
        }

        scriptFiles.forEach((file) => {
            handleFile(ResourceTypes.SCRIPT, project, file);
        });

        if (project.bundleScript) {
            handleBundle(ResourceTypes.SCRIPT, project);
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

                watchFolder(ResourceTypes.STYLE, project);
                watchFolder(ResourceTypes.SCRIPT, project);

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
