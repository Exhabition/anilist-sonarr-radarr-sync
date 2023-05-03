import { config } from "dotenv";
config();

import { SchedulerService } from "./helper/SchedulerService";
import { Radarr } from "./requests/Radarr";
import { Sonarr } from "./requests/Sonarr";

const hostname = process.env.HOSTNAME;

const sonarrInstance = new Sonarr({
    hostname,
    apiKey: process.env.SONARR_API_KEY
});
const radarrInstance = new Radarr({
    hostname,
    apiKey: process.env.RADARR_API_KEY
});

const scheduler = new SchedulerService(async () => {
    const isSonarrAlive = await sonarrInstance.healthCheck();
    if (isSonarrAlive) console.log("Sonarr is healthy");

    const isRadarrAlive = await radarrInstance.healthCheck();
    if (isRadarrAlive) console.log("Radarr is healthy");

    // const rootFolders = await sonarrInstance.getRootFolders();
    // const languageProfiles = await sonarrInstance.getLanguageProfiles();
    // const qualityprofiles = await sonarrInstance.getQualityProfiles();
    // console.log(rootFolders, languageProfiles, qualityprofiles);
    await sonarrInstance.addMedia("e").catch(console.error);
}, 1000 * 60);

scheduler.start(true);