"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class HttpClient {
    constructor() {
        this.authToken = '';
        this.baseUrl = '';
        this.environment = '';
        this.organization = '';
        this.interceptResponses = {};
        if (!utils_1.utils.isNode() && localStorage.getItem('carol-token')) {
            this.authToken = localStorage.getItem('carol-token').replace(/\"/g, '');
        }
    }
    addInterceptor(name, fn) {
        this.interceptResponses[name] = fn;
    }
    removeInterceptor(name) {
        delete this.interceptResponses[name];
    }
    postFormUrlencoded(url, data) {
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
    post(url, body, queryParams) {
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
    postForm(url, form, queryParams) {
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
    delete(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('authorization', this.authToken);
        return this.processResponse(xhr);
    }
    get(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${this.baseUrl}${url}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('accept', 'application/json');
        xhr.setRequestHeader('authorization', this.authToken);
        return this.processResponse(xhr);
    }
    runInterceptors(status, response) {
        Object.keys(this.interceptResponses).forEach(key => {
            this.interceptResponses[key](status, response);
        });
    }
    processResponse(xhr) {
        return new Promise((resolve, reject) => {
            const _this = this;
            xhr.onload = function () {
                const body = JSON.parse(xhr.responseText);
                _this.runInterceptors(xhr.status, body);
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(body);
                }
                else if (xhr.status !== 200) {
                    reject(body);
                }
            };
        });
    }
}
exports.httpClient = new HttpClient();
