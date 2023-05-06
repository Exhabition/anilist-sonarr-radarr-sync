import axios, { AxiosInstance, AxiosResponse } from "axios";

import { Title, client } from "../aniList/Client";
import { getExistingTitle } from "../index";
import { saveEntry } from "../controllers/mediaController";

export interface RequestClientOptions {
    hostname: string;
    apiKey: string;
    port?: number;
    urlBase?: string;
    ssl?: boolean;
    username?: string;
    password?: string;
    timeout?: number;
    rootFolderPath: string;
    qualityProfileId: number;
    languageProfileId: number;
}

export class RequestClient {
    hostname: string;
    apiKey: string;
    port: number;
    urlBase: string;
    rootFolderPath: string;
    qualityProfileId: number;
    languageProfileId: number;
    postPath: "/series" | "/movie";
    client: AxiosInstance

    constructor(options: RequestClientOptions, postPath: "/series" | "/movie") {
        const sslType = `http${options.ssl ? "s" : ""}://`;
        const hostname = options.hostname;
        const urlBase = options.urlBase || "";
        const port = options.port;

        this.rootFolderPath = options.rootFolderPath;
        this.languageProfileId = options.languageProfileId;
        this.qualityProfileId = options.qualityProfileId;
        this.postPath = postPath;

        this.client = axios.create({
            baseURL: `${sslType}${hostname}:${port}${urlBase}/api/v3`,
            
            timeout: options.timeout || 5000,
            headers: {
                "X-Api-Key": options.apiKey,
            }
        });
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

    async addMedia(aniListId: number, title: Title) {
        const externalIds = await client.getExternalIdsFromAniListId(aniListId).catch(error => console.error(error.message));
        if (!externalIds) throw new Error("No External IDs found");

        const neededService = this.postPath === "/movie" ? "tmdbId" : "tvdbId";
        const neededId = this.postPath === "/movie" ? externalIds["themoviedb_id"] : externalIds["thetvdb_id"];
        if (!neededId) throw new Error(`${neededService} not found`)

        const postOptions: { [key: string]: any } = {
            title: getExistingTitle(title),
            languageProfileId: this.languageProfileId,
            qualityProfileId: this.qualityProfileId,
            rootFolderPath: this.rootFolderPath,
            monitored: true,
            addOptions: {
                monitor: this.postPath === "/movie" ? "movieOnly" : "all",
            }
        }
        postOptions[neededService] = neededId;

        await this.client.post<AxiosResponse>(this.postPath, postOptions).catch(async error => {
            const reason = error.response?.data[0]?.errorCode;
            if (reason === "SeriesExistsValidator" || reason === "MovieExistsValidator") return console.log("Already imported, ignoring");

            throw new Error(error);
        });

        await saveEntry(aniListId, false, true);
    }
}