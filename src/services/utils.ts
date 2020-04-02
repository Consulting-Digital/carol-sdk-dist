import { httpClient } from './http-client';

declare const process;

class Utils {

    getDefaultConnectorId() {
        return '0a0829172fc2433c9aa26460c31b78f0';
    }

    getEnvironment() {
        return httpClient.environment;
    }

    getOrganization() {
        return httpClient.organization;
    }

    isNode() {
        return typeof window === 'undefined' 
            || typeof window.document === 'undefined';
    }

}

export const utils = new Utils();