import { RequestClient, RequestClientOptions } from "./RequestClient";

export class Radarr extends RequestClient {
    constructor(options: RequestClientOptions) {
        const radarrOptions: RequestClientOptions = {
            hostname: options.hostname,
            apiKey: options.apiKey,
            port: options.port || 7878,
            urlBase: options.urlBase,
            ssl: options.ssl ? true : false,
            username: options.username,
            password: options.password,
            timeout: options.timeout,
        }

        super(radarrOptions);
    }
}