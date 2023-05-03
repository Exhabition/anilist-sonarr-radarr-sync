import { SchedulerService } from "./helper/SchedulerService";
import { Radarr } from "./requests/Radarr";
import { Sonarr } from "./requests/Sonarr";

const hostname = "hostname";

const sonarrInstance = new Sonarr({
    hostname,
    apiKey: "sonarrKey",
});
const radarrInstance = new Radarr({
    hostname,
    apiKey: "radarrKey"
});

const scheduler = new SchedulerService(async () => {
    const isSonarrAlive = await sonarrInstance.healthCheck();
    if (isSonarrAlive) console.log("Sonarr is healthy");

    const isRadarrAlive = await radarrInstance.healthCheck();
    if (isRadarrAlive) console.log("Radarr is healthy");
}, 1000 * 60);

scheduler.start(true);