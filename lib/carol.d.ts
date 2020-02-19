import { Query } from './query';
declare class Carol {
    constructor();
    private templatesMapByName;
    login(username: string, password: string): Promise<any>;
    logout(): Promise<unknown>;
    select<T>(...fields: string[]): Query<T>;
    setBaseUrl(baseUrl: any): void;
    setAuthToken(authToken: string): void;
    setEnvironment(environment: string): void;
    setOrganization(organization: string): void;
    postGolden(dataModel: any, mdmGoldenFieldAndValues: any): Promise<unknown>;
    updateGolden(dataModel: any, mdmId: string, mdmGoldenFieldAndValues: any): Promise<unknown>;
    deleteGolden(dataModel: any, mdmId: string): Promise<unknown>;
    private getDataModel;
    private getTemplates;
}
export declare const carol: Carol;
export {};
