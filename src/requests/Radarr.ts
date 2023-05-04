import { RequestClient, RequestClientOptions } from "./RequestClient";

export class Radarr extends RequestClient {
    constructor(options: RequestClientOptions) {
        if (!options.port) options.port = 7878;

        super(options, "/movie");
    }
}