import { RequestClient, RequestClientOptions } from "./RequestClient";

export class Sonarr extends RequestClient {
    constructor(options: RequestClientOptions) {
        if (!options.port) options.port = 8989;

        super(options, "/series");
    }
}