/*
    @Author     Stein Lundbeck
    @Date        11.08.2021
    @Version    2.0
*/

import util from './/WRCUtility.mjs';
import config from ".//WRCConfig.json";
import fs from "fs";

for (const tmp of config.projects) {
	let project = util.getProject(tmp);

	if (project.name) {
		if (project.base) {
			util.log("Load", project.name);

			/*
			if (project.reCompile) {
				util.handleReCompile(project, () => {

				});
			}
			*/
		}
		else {
			util.logError("Load", "Project missing parameter 'basePath'");
		}
	}
	else {
		util.logError("Load", "Project missing parameter 'name'");
	}
}
