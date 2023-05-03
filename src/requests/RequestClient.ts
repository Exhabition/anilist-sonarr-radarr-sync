import axios, { AxiosInstance, AxiosResponse } from "axios";

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

    async healthCheck() {
        const response = await this.client.get<AxiosResponse>("/health").catch(console.error);
        return response && response.status === 200;
    }
}