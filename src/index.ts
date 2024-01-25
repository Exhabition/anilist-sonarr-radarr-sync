import { config as dotenv } from "dotenv";
dotenv();
import config from "./config";
import { SchedulerService } from "./helper/SchedulerService";
import { Radarr } from "./requests/Radarr";
import { Sonarr } from "./requests/Sonarr";
import { getEntries, getEntry, saveEntry } from "./controllers/mediaController";
import { Title, client } from "./aniList/Client";

const hostname = process.env.HOSTNAME;
const monitoredLists = process.env.MONITORED_LISTS || ["CURRENT", "PLANING"];

const RADARR_TYPES = ["MOVIE"];
// Usually these will already be monitored with sonarr
const IGNORED_TYPES = config.anilist.ignore

const sonarrInstance = new Sonarr({
    hostname,
    apiKey: process.env.SONARR_API_KEY,
    qualityProfileId: config.sonarr.qualityProfile,
    rootFolderPath: config.sonarr.rootFolder || "/Media/Anime/Series"
});
const radarrInstance = new Radarr({
    hostname,
    apiKey: process.env.RADARR_API_KEY,
    qualityProfileId: config.radarr.qualityProfile,
    rootFolderPath: config.radarr.rootFolder || "/Media/Anime/Movies"
});

const scheduler = new SchedulerService(async () => {

    const isSonarrAlive = await sonarrInstance.healthCheck();
    if (isSonarrAlive) console.log("Sonarr is healthy");

    const isRadarrAlive = await radarrInstance.healthCheck();
    if (isRadarrAlive) console.log("Radarr is healthy");

    await client.getAnimeMappings();

    const anilists = await client.getUserLists(process.env.ANILIST_ID);
    for (const list of anilists) {
        if (list.status && monitoredLists.includes(list.status)) {
            console.log(`Importing: ${list.status} (${list.entries.length} entries)`)
            // TODO ignore if last updated is equal to last check
            for (const entry of list.entries) {
                if (IGNORED_TYPES.includes(entry.media.format)) continue;

                if (entry.media.isAdult) {
                    console.warn(`${getExistingTitle(entry.media.title)} is adult content, you will most likely have to add it manually`);
                }

                const isImported = await getEntry(entry.mediaId);
                if (!isImported || (isImported.success == false && isImported.exclude == false)) {
                    const typeInstance = RADARR_TYPES.includes(entry.media.format) ? radarrInstance : sonarrInstance;
                    console.log(`Adding ${getExistingTitle(entry.media.title)} to ${RADARR_TYPES.includes(entry.media.format) ? "Radarr" : "Sonarr"}`)
                    await typeInstance.addMedia(entry.mediaId, entry.media.title).catch(async (error) => {
                        if (error) console.error(error.message);

                        if (!isImported) await saveEntry(entry.mediaId, false, false);
                    });
                }
            }
        }
    }
    console.log("Done")

    const entries = await getEntries();
    console.log(`Successful: ${entries.filter(entry => entry.success).length}`);
    console.log(`Failed: ${entries.filter(entry => !entry.success).length}`);
}, 1000 * 5);

export function getExistingTitle(title: Title) {
    return title.english || title.romaji || title.native;
}

scheduler.start(true);
