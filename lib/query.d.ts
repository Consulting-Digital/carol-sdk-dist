export declare class FilterStatement<T> {
    query: Query<T>;
    field: string;
    filterType: string;
    constructor(query: any, field: any, filterType: any);
    greaterThan(value: any): Query<T>;
    lowerThan(value: any): Query<T>;
    between(min: any, max: any): Query<T>;
    isTrue(): Query<T>;
    equals(value: any): Query<T>;
    like(value: any): Query<T>;
    notEquals(value: any): Query<T>;
    notLike(value: any): Query<T>;
    isNested(field: any): boolean;
}
export declare class Query<T> {
    private fields;
    private idx;
    private size;
    private off;
    private aggregationType;
    private namedQuery;
    private namedQueryParams;
    private sort;
    private sortOrder;
    constructor(fields: string[]);
    raw: {
        mustList: any[];
        mustNotList: any[];
        shouldList: any[];
        shouldNotList: any[];
        aggregationList: any[];
    };
    named(name: any): this;
    params(params: object): this;
    index(index: any): this;
    from(dataModel: any): this;
    pageSize(size: any): this;
    offset(off: any): this;
    count(field: any, size?: number): this;
    min(field: any): this;
    max(field: any): this;
    sum(field: any): this;
    stats(field: any): this;
    extendedStats(field: any): this;
    unique(field: any): this;
    prepareQueryParams(): any;
    prepareQuery(): any;
    private aggregate;
    or(field: string): FilterStatement<T>;
    and(field: string): FilterStatement<T>;
    orderBy(field: string): this;
    ascending(): this;
    descending(): this;
    private prefixGolden;
    execute(): Promise<Response<T>>;
    private deepFind;
    private getDataModel;
    private getNamedQuery;
}
export declare class Response<T> {
    hits: Array<T>;
    aggs: any;
    count: number;
    totalHits: number;
    took: number;
}
export declare class CountResponse extends Response<any> {
    aggs: {
        key: any;
        count: number;
    }[];
}
