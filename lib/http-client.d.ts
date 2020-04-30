declare class HttpClient {
    authToken: string;
    baseUrl: string;
    environment: string;
    organization: string;
    private interceptResponses;
    constructor();
    addInterceptor(name: string, fn: (status: any, response: any) => void): void;
    removeInterceptor(name: any): void;
    postFormUrlencoded(url: string, data: string): Promise<unknown>;
    post(url: string, body: object, queryParams?: any): Promise<any>;
    postForm(url: string, form: FormData, queryParams?: any): Promise<any>;
    delete(url: string): Promise<any>;
    get(url: string): Promise<any>;
    private runInterceptors;
    private processResponse;
}
export declare const httpClient: HttpClient;
export {};
