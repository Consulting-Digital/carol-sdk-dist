"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_client_1 = require("./http-client");
const utils_1 = require("./utils");
class AuthService {
    login(email, password) {
        let fd = `grant_type=password&username=${encodeURIComponent(email)}`;
        fd += `&password=${encodeURIComponent(password)}`;
        fd += `&subdomain=${utils_1.utils.getEnvironment()}`;
        fd += `&connectorId=${utils_1.utils.getDefaultConnectorId()}`;
        if (utils_1.utils.getOrganization()) {
            fd += `&orgSubdomain=${utils_1.utils.getOrganization()}`;
        }
        return http_client_1.httpClient.postFormUrlencoded('/api/v1/oauth2/token', fd).then((response) => {
            http_client_1.httpClient.authToken = response.access_token;
            if (!utils_1.utils.isNode()) {
                localStorage.setItem('carol-token', http_client_1.httpClient.authToken);
            }
            return response;
        });
    }
    logout() {
        const fd = `access_token=${http_client_1.httpClient.authToken}`;
        return http_client_1.httpClient.postFormUrlencoded('/api/v1/oauth2/logout', fd).then(response => {
            if (!utils_1.utils.isNode()) {
                localStorage.removeItem('carol-token');
            }
            http_client_1.httpClient.authToken = null;
            return response;
        });
    }
}
exports.authService = new AuthService();
