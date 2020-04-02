import { authService } from './auth-service';
import { httpClient } from './http-client';
import { Query } from './query';
import { utils } from './utils';

declare function require(name: string);
declare const global;

class Carol {

  constructor() {}

  private templatesMapByName: any;

  login(username: string, password: string) {
    return authService.login(username, password);
  }

  logout() {
    return authService.logout();
  }

  select<T>(...fields: string[]) {
    return new Query<T>(fields);
  }

  setBaseUrl(baseUrl) {
    httpClient.baseUrl = baseUrl;
  }

  setAuthToken(authToken: string) {
    httpClient.authToken = authToken;
  }

  setEnvironment(environment: string) {
    httpClient.environment = environment;
  }

  setOrganization(organization: string) {
    httpClient.organization = organization;
  }

  postGolden(dataModel: any, mdmGoldenFieldAndValues: any) {
    dataModel = this.getDataModel(dataModel);

    return new Promise((resolve, reject) => {
      this.getTemplates().then(templatesByName => {
        httpClient
          .post(`/api/v1/entities/templates/${templatesByName[dataModel].mdmId}/goldenRecords`, mdmGoldenFieldAndValues)
          .then(resolve).catch(reject);
      });
    });
  }

  updateGolden(dataModel: any, mdmId: string, mdmGoldenFieldAndValues: any) {
    dataModel = this.getDataModel(dataModel);

    return new Promise((resolve, reject) => {
      this.getTemplates().then(templatesByName => {
        httpClient
          .post(`/api/v1/entities/templates/${templatesByName[dataModel].mdmId}/goldenRecords/${mdmId}/edit`, mdmGoldenFieldAndValues)
          .then(resolve).catch(reject);
      });
    });
  }

  deleteGolden(dataModel: any, mdmId: string) {
    dataModel = this.getDataModel(dataModel);

    return new Promise((resolve, reject) => {
      this.getTemplates().then(templatesByName => {
        httpClient
          .delete(`/api/v1/entities/templates/${templatesByName[dataModel].mdmId}/goldenRecords/${mdmId}`)
          .then(resolve).catch(reject);
      });
    });
  }

  private getDataModel(dataModel: any): string {
    if (typeof dataModel !== 'string') {
      return dataModel.prototype.constructor.dataModelName;
    }

    return dataModel;
  }

  private getTemplates() {
    if (this.templatesMapByName) {
      return new Promise(resolve => {
        resolve(this.templatesMapByName);
      });
    }

    return httpClient.get('/api/v1/admin/entities/templates').then(
      (templates: any) => {
        this.templatesMapByName = {};
        templates.hits.forEach(template => {
          this.templatesMapByName[template.mdmName] = template;
        });

        return this.templatesMapByName;
      }
    );
  }
}

export const carol = new Carol();
