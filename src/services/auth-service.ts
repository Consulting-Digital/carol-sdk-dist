import { httpClient } from './http-client';
import { utils } from './utils';

class AuthService {
    login(email: string, password: string) {
        let fd = `grant_type=password&username=${encodeURIComponent(email)}`;
        fd += `&password=${encodeURIComponent(password)}`;
        fd += `&connectorId=${utils.getDefaultConnectorId()}`;
        
        if (utils.getOrganization()) {
            fd += `&orgSubdomain=${utils.getOrganization()}`
        }

        if (utils.getEnvironment()) {
            fd += `&subdomain=${utils.getEnvironment()}`;
        }
        
        return httpClient.postFormUrlencoded('/api/v1/oauth2/token', fd).then((response: any) => {
            httpClient.authToken = response.access_token;

            if (!utils.isNode()) {
                localStorage.setItem('carol-token', httpClient.authToken);
            }

            return response;
        });
    }

    logout() {
        const fd = `access_token=${httpClient.authToken}`;

        return httpClient.postFormUrlencoded('/api/v1/oauth2/logout', fd).then(response => {

            if (!utils.isNode()) {
                localStorage.removeItem('carol-token');
            }

            httpClient.authToken = null;
            return response;
        });
    }
}

export const authService = new AuthService();