# Web Resource Compiler &copy; 2020, Lundbeck Consulting

Compiles and minimizes typical resources in web projects and is fully customizable to fit your project.

It supports multiple projects and a project can either use the default settings or custom properties.

Requires Node.js [(https://nodejs.org)](https://nodejs.org)

> Currently supports SASS and JavaScript files

## Config

The configuration is flexible and supports any structure. The file includes default values that's used to supplement the configured project if the value isn't defined. The default values comes ready for an ASP.NET Core MVC site two folders named STYLE and SCRIPT, writing result to the same folders in wwwroot, but you can change this to suit your needs.

### Properties

* **stylePath**: Path to SASS files
* **styleOutPath**: Path to folder for resulting CSS files
* **styleBundlePath**: Path to folder for bundles CSS file
* **scriptPath**: Path to JavaScript files
* **scriptOutPath**: Path to folder for resulting JavaScript files
* **scriptBundlePath**: Path to folder for bundles JavaScript file
* **reCompile**: If set to _true_ recompiles all files in project

Example:

```JSON
{
  "projects": [
    {
        "name": "Project One",
        "basePath": ".//Client//Client One//Project One"
    },
    {
      "name": "Custom Project",
      "basePath": ".//Folder//DEV//Custom.Project",
      "styleOutPath": "<base>//_Build//STYLE",
      "scriptOutPath": "<base>//_Build//SCRIPT",
      "styleBundlePath": "<base>//_Build//Custom.css",
      "scriptBundlePath": "<base>//_Build//Custom.js"
    },
],
  "default": {
    "stylePath": "<base>//STYLE",
    "styleOutPath": "<base>//wwwroot//STYLE",
    "styleBundlePath": "<base>//wwwroot//STYLE//<name>.css",
    "scriptPath": "<base>//SCRIPT",
    "scriptOutPath": "<base>//wwwroot//SCRIPT",
    "scriptBundlePath": "<base>//wwwroot//SCRIPT//<name>.js",
    "reCompile": false
  }
}
```

## Run

> **npm run WebResourceCompiler**


---

* [https://github.com/orgs/lundbeckconsulting](https://github.com/orgs/lundbeckconsulting)
* [https://lundbeckconsulting.no](https://lundbeckconsulting.no)
* [http://getcreatorframework.com](http://getcreatorframework.com)
* [lc@lundbeckconsulting.no](mailto:lc@lundbeckconsulting.no)
