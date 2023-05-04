import axios, { AxiosResponse } from "axios";

interface Mappings {
    "livechart_id": number,
    "anime-planet_id": string,
    "anisearch_id": number,
    "anidb_id": number,
    "kitsu_id": number,
    "mal_id": number,
    "notify.moe_id": string,
    "anilist_id": number,
    "thetvdb_id": number,
    "imdb_id": string,
    "themoviedb_id": number
}

export type Title = {
    english?: string;
    romaji?: string;
    native: string;
}

interface Anilist {
    isCustomList: boolean;
    status: "COMPLETED" | "CURRENT" | "DROPPED" | "PLANNING";
    entries: {
        mediaId: number;
        media: {
            format: "TV" | "TV_SHORT" | "SHORT" | "MOVIE" | "OVA" | "SPECIAL"
            title: Title
            isAdult: boolean
        }
    }[]
}

interface AnilistsResponse {
    data: {
        MediaListCollection: {
            lists: Anilist[]
        }
    }
}

class AniListClient {
    cachedMappings: Mappings[];

    async getAnimeMappings(): Promise<Mappings[]> {
        if (this.cachedMappings) return this.cachedMappings;

        const response = await axios.get("https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json")
            .then(res => res.data);
        if (!response) throw new Error("No mappings found");

        this.cachedMappings = response;

        return this.cachedMappings;
    }

    async getExternalIdsFromAniListId(aniListId: number) {
        const mappings = await this.getAnimeMappings();
        if (!mappings) return console.error("Failed to load mappings");

        console.log(aniListId)
        const match = mappings.find(info => info.anilist_id === aniListId);
        if (!match) throw new Error(`No Id's for ${aniListId}`)

        return match;
    }

    async getUserLists(userId: number) {
        return axios.post<AnilistsResponse>("https://graphql.anilist.co", {
            query: `
            query {        
                MediaListCollection (userId: ${userId}, type: ANIME) { 
                    lists { 
                        isCustomList status entries {
                            mediaId media { title { romaji english native } format isAdult }
                        } 
                    }
                } 
            }`
        }).then(res => res.data.data.MediaListCollection.lists)
    }
}

const client = new AniListClient();

export { client };