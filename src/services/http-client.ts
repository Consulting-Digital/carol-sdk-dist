import { utils } from "./utils";

class HttpClient {

    authToken: string = '';
    baseUrl: string = '';
    environment: string = '';
    organization: string = '';

    private interceptResponses = {};

    constructor() {
        if (!utils.isNode() && localStorage.getItem('carol-token')) {
            this.authToken = localStorage.getItem('carol-token').replace(/\"/g, '');
        }
    }

    addInterceptor(name: string, fn: (status, response) => void) {
        this.interceptResponses[name] = fn;
    }

    removeInterceptor(name) {
        delete this.interceptResponses[name];
    }

    postFormUrlencoded(url: string, data: string) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        if (this.authToken) {
            xhr.setRequestHeader('authorization', this.authToken);
        }
        xhr.send(data);

        return this.processResponse(xhr);
    }

    post(url: string, body: object, queryParams?: any): Promise<any> {
        const xhr = new XMLHttpRequest();

        if (queryParams) {
            url += '?';
            const queryUrl = Object.keys(queryParams).map(key => {
                const value = queryParams[key];
                return `${key}=${value}`;
            });
            url += queryUrl.join('&');
        }

        xhr.open('POST', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('authorization', this.authToken);
        xhr.send(JSON.stringify(body));

        return this.processResponse(xhr);
    }

    postForm(url: string, form: FormData, queryParams?: any): Promise<any> {
        const xhr = new XMLHttpRequest();

        if (queryParams) {
            url += '?';
            const queryUrl = Object.keys(queryParams).map(key => {
                const value = queryParams[key];
                return `${key}=${value}`;
            });
            url += queryUrl.join('&');
        }

        xhr.open('POST', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('authorization', this.authToken);
        xhr.send(form);

        return this.processResponse(xhr);
    }

    delete(url: string): Promise<any> {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('authorization', this.authToken);
        xhr.send();
        return this.processResponse(xhr);
    }

    get(url: string): Promise<any> {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('authorization', this.authToken);
        xhr.send();
        return this.processResponse(xhr);
    }

    private runInterceptors(status, response) {
        Object.keys(this.interceptResponses).forEach(key => {
            this.interceptResponses[key](status, response);
        });
    }

    private processResponse(xhr) {
        return new Promise((resolve, reject) => {
            const _this = this;
            xhr.onload = function() {
                const body = JSON.parse(xhr.responseText);

                _this.runInterceptors(xhr.status, body);

                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(body);
                } else if (xhr.status !== 200) {
                    reject(body);
                }
            };
        });
    }

}

export const httpClient = new HttpClient();
