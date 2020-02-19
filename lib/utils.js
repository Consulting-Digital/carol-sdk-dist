"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_client_1 = require("./http-client");
class Utils {
    getDefaultConnectorId() {
        return '0a0829172fc2433c9aa26460c31b78f0';
    }
    getEnvironment() {
        return http_client_1.httpClient.environment;
    }
    getOrganization() {
        return http_client_1.httpClient.organization;
    }
    isNode() {
        return typeof window === 'undefined'
            || typeof window.document === 'undefined';
    }
}
exports.utils = new Utils();
