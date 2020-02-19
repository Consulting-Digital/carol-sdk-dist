"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("./auth-service");
const http_client_1 = require("./http-client");
const query_1 = require("./query");
class Carol {
    constructor() { }
    login(username, password) {
        return auth_service_1.authService.login(username, password);
    }
    logout() {
        return auth_service_1.authService.logout();
    }
    select(...fields) {
        return new query_1.Query(fields);
    }
    setBaseUrl(baseUrl) {
        http_client_1.httpClient.baseUrl = baseUrl;
    }
    setAuthToken(authToken) {
        http_client_1.httpClient.authToken = authToken;
    }
    setEnvironment(environment) {
        http_client_1.httpClient.environment = environment;
    }
    setOrganization(organization) {
        http_client_1.httpClient.organization = organization;
    }
    postGolden(dataModel, mdmGoldenFieldAndValues) {
        dataModel = this.getDataModel(dataModel);
        return new Promise((resolve, reject) => {
            this.getTemplates().then(templatesByName => {
                http_client_1.httpClient
                    .post(`/api/v1/entities/templates/${templatesByName[dataModel].mdmId}/goldenRecords`, mdmGoldenFieldAndValues)
                    .then(resolve).catch(reject);
            });
        });
    }
    updateGolden(dataModel, mdmId, mdmGoldenFieldAndValues) {
        dataModel = this.getDataModel(dataModel);
        return new Promise((resolve, reject) => {
            this.getTemplates().then(templatesByName => {
                http_client_1.httpClient
                    .post(`/api/v1/entities/templates/${templatesByName[dataModel].mdmId}/goldenRecords/${mdmId}/edit`, mdmGoldenFieldAndValues)
                    .then(resolve).catch(reject);
            });
        });
    }
    deleteGolden(dataModel, mdmId) {
        dataModel = this.getDataModel(dataModel);
        return new Promise((resolve, reject) => {
            this.getTemplates().then(templatesByName => {
                http_client_1.httpClient
                    .delete(`/api/v1/entities/templates/${templatesByName[dataModel].mdmId}/goldenRecords/${mdmId}`)
                    .then(resolve).catch(reject);
            });
        });
    }
    getDataModel(dataModel) {
        if (typeof dataModel !== 'string') {
            return dataModel.prototype.constructor.dataModelName;
        }
        return dataModel;
    }
    getTemplates() {
        if (this.templatesMapByName) {
            return new Promise(resolve => {
                resolve(this.templatesMapByName);
            });
        }
        return http_client_1.httpClient.get('/api/v1/admin/entities/templates').then((templates) => {
            this.templatesMapByName = {};
            templates.hits.forEach(template => {
                this.templatesMapByName[template.mdmName] = template;
            });
            return this.templatesMapByName;
        });
    }
}
exports.carol = new Carol();
