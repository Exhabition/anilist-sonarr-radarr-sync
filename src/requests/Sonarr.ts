import { RequestClient, RequestClientOptions } from "./RequestClient";

export class Sonarr extends RequestClient {
    constructor(options: RequestClientOptions) {
        const sonarrOptions: RequestClientOptions = {
            hostname: options.hostname,
            apiKey: options.apiKey,
            port: options.port || 8989,
            urlBase: options.urlBase,
            ssl: options.ssl ? true : false,
            username: options.username,
            password: options.password,
            timeout: options.timeout,
        }

        super(sonarrOptions);
    }
}