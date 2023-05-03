import axios, { AxiosInstance, AxiosResponse } from "axios";

interface Mappings {
    "livechart_id": number,
    "thetvdb_id": number,
    "anime-planet_id": string,
    "anisearch_id": number,
    "anidb_id": number,
    "kitsu_id": number,
    "mal_id": number,
    "type": "OVA" | "MOVIE",
    "notify.moe_id": string,
    "anilist_id": number
}

export interface RequestClientOptions {
    hostname: string;
    apiKey: string;
    port?: number;
    urlBase?: string;
    ssl?: boolean;
    username?: string;
    password?: string;
    timeout?: number;
}

export class RequestClient {
    hostname: string;
    apiKey: string;
    port: number;
    urlBase: string;
    client: AxiosInstance

    constructor(options: RequestClientOptions) {
        const sslType = `http${options.ssl ? "s" : ""}://`;
        const hostname = options.hostname;
        const urlBase = options.urlBase || "";
        const port = options.port;

        this.client = axios.create({
            baseURL: `${sslType}${hostname}:${port}${urlBase}/api/v3`,
            
            timeout: options.timeout || 5000,
            headers: {
                "X-Api-Key": options.apiKey,
            }
        });
    }

    async getAnimeMappings(): Promise<Mappings[]> {
        return await axios.get<Mappings[]>("https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json")
            .then(res => res.data);
    }

    async getTVDBIdFromAniListId(aniListId: number) {
        const mappings = await this.getAnimeMappings();
        if (!mappings) return console.error("Failed to load mappings");

        const match = mappings.find(info => info.anilist_id === aniListId);
        return match?.thetvdb_id;
    }

    async healthCheck() {
        const response = await this.client.get<AxiosResponse>("/health").catch(console.error);
        return response && response.status === 200;
    }

    async getQualityProfiles() {
        return await this.client.get("/qualityprofile").then(res => res.data);
    }

    async getLanguageProfiles() {
        return await this.client.get("/languageprofile").then(res => res.data);
    }

    async getRootFolders() {
        return await this.client.get("/rootfolder").then(res => res.data);
    }

    async addMedia(path: string) {
        const tvdbId = await this.getTVDBIdFromAniListId(113813);

        const response = await this.client.post<AxiosResponse>("/series", {
            title: "Rent-a-Girlfriend",
            tvdbId: tvdbId,
            languageProfileId: 5,
            qualityProfileId: 1,
            rootFolderPath: "/Media/Anime/Series",
            monitored: true,
            addOptions: {
                monitor: "all",
            }
        }).catch(error => {
            console.log(error.response.data);
        });

        if (!response) throw new Error("Test");

        return response.data;
    }
}