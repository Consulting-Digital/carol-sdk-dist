import { httpClient } from './http-client';

export class FilterStatement<T> {
  query: Query<T>;
  field: string;
  filterType: string;
 
  constructor(query, field, filterType) {
    this.query = query;
    this.field = field;
    this.filterType = filterType;
  }

  greaterThan(value) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_RANGE_FILTER' : 'RANGE_FILTER',
      mdmKey: this.field,
      mdmValue: [value, null]
    };

    if (this.filterType === 'and') {
      this.query.raw.mustList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldList.push(queryObj);
    }

    return this.query;
  }

  lowerThan(value) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_RANGE_FILTER' : 'RANGE_FILTER',
      mdmKey: this.field,
      mdmValue: [null, value]
    };

    if (this.filterType === 'and') {
      this.query.raw.mustList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldList.push(queryObj);
    }

    return this.query;
  }

  between(min, max) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_RANGE_FILTER' : 'RANGE_FILTER',
      mdmKey: this.field,
      mdmValue: [min, max]
    };

    if (this.filterType === 'and') {
      this.query.raw.mustList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldList.push(queryObj);
    }

    return this.query;
  }

  isTrue() {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_BOOL_FILTER' : 'BOOL_FILTER',
      mdmKey: `${this.field}`,
      mdmValue: true
    };

    if (this.filterType === 'and') {
      this.query.raw.mustList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldList.push(queryObj);
    }

    return this.query;
  }

  equals(value) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_TERM_FILTER' : 'TERM_FILTER',
      mdmKey: `${this.field}.raw`,
      mdmValue: value
    };

    if (this.filterType === 'and') {
      this.query.raw.mustList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldList.push(queryObj);
    }

    return this.query;
  }

  like(value) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_MATCH_FILTER' : 'MATCH_FILTER',
      mdmKey: `${this.field}.folded`,
      mdmValue: value.toLowerCase()
    };

    if (this.filterType === 'and') {
      this.query.raw.mustList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldList.push(queryObj);
    }

    return this.query;
  }

  notEquals(value) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_TERM_FILTER' : 'TERM_FILTER',
      mdmKey: `${this.field}.raw`,
      mdmValue: value
    };

    if (this.filterType === 'and') {
      this.query.raw.mustNotList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldNotList.push(queryObj);
    }

    return this.query;
  }

  notLike(value) {
    const queryObj = {
      mdmFilterType: this.isNested(this.field) ? 'NESTED_MATCH_FILTER' : 'MATCH_FILTER',
      mdmKey: `${this.field}.folded`,
      mdmValue: value.toLowerCase()
    };

    if (this.filterType === 'and') {
      this.query.raw.mustNotList.push(queryObj);
    } else if (this.filterType === 'or') {
      this.query.raw.shouldNotList.push(queryObj);
    }

    return this.query;
  }

  isNested(field) {
    if (field.includes('mdmGoldenFieldAndValues.')) {
      return field.substr(24).indexOf('.') > -1;
    }
  }
}

export class Query<T> {
  private fields = null;
  private idx = 'MASTER';
  private size = 20;
  private off = 0;

  private aggregationType: string;

  private namedQuery: string = null;
  private namedQueryParams: object = null;

  private sort = 'mdmLastUpdated';
  private sortOrder = 'DESC';

  constructor(fields: string[]) {
    this.fields = fields;
  }

  raw = {
    mustList: [],
    mustNotList: [],
    shouldList: [],
    shouldNotList: [],
    aggregationList: []
  };

  named(name: any) {
    name = this.getNamedQuery(name);
    this.namedQuery = name;
    return this;
  }

  params(params: object) {
    this.namedQueryParams = params;
    return this;
  }

  index(index) {
    this.idx = index;

    return this;
  }

  from(dataModel: any) {

    dataModel = this.getDataModel(dataModel);

    this.raw.mustList.push({
      mdmFilterType: 'TYPE_FILTER',
      mdmValue: `${dataModel}Golden`
    });

    return this;
  }

  pageSize(size) {
    this.size = size;

    return this;
  }

  offset(off) {
    this.off = off;

    return this;
  }

  count(field, size?: number) {
    this.aggregationType = 'COUNT';
    this.aggregate(field, 'TERM', size);
    return this;
  }

  min(field) {
    this.aggregate(field, 'MINIMUM');
    return this;
  }

  max(field) {
    this.aggregate(field, 'MAXIMUM');
    return this;
  }

  sum(field) {
    this.aggregate(field, 'SUM');
    return this;
  }

  stats(field) {
    this.aggregate(field, 'STATS');
    return this;
  }

  extendedStats(field) {
    this.aggregate(field, 'EXTENDED_STATS');
    return this;
  }

  unique(field) {
    this.aggregate(field, 'CARDINALITY');
    return this;
  }

  prepareQueryParams() {

    let queryParams: any = {
      pageSize: this.size.toString(),
      offset: this.off.toString(),
      index: this.idx,
      sortBy: this.sort,
      sortOrder: this.sortOrder
    };

    if (this.fields && this.fields.length) {
      queryParams.fields = this.fields.map(f => this.prefixGolden(f)).join(',');
    }

    return queryParams;
  }

  prepareQuery() {
    const rawQuery = JSON.parse(JSON.stringify(this.raw));

    if (this.aggregationType) {

      if (!this.sort) {
        this.sort = this.aggregationType;
      }

      let aggregation = rawQuery.aggregationList[0];

      while (aggregation.subAggregations && aggregation.subAggregations.length) {
        aggregation = aggregation.subAggregations;
      }

      aggregation.sortBy = this.sort.toLowerCase() === this.aggregationType.toLowerCase()? `_${this.sort}` : this.sort;
      aggregation.sortOrder = this.sortOrder || 'DESC';
    }
   

    if (!this.namedQuery) {

      if (rawQuery.mustNotList.length === 0) {
        delete rawQuery.mustNotList;
      }

      if (rawQuery.shouldList.length === 0) {
        delete rawQuery.shouldList;
      }

      if (rawQuery.shouldNotList.length === 0) {
        delete rawQuery.shouldNotList;
      }

      if (rawQuery.aggregationList.length === 0) {
        delete rawQuery.aggregationList;
      }
    }

    return rawQuery;
  }

  private aggregate(field, aggregationType, size = 10) {
    field = this.prefixGolden(field);
    const fieldParts = field.split('.');
    let aggregationRoot = {};
    let aggregation: any = aggregationRoot;
    if (fieldParts.length > 1) {
      for (let i = 1; i < fieldParts.length; i++) {
        let type = 'NESTED';
        if (i === fieldParts.length - 1) {
          type = aggregationType;
        }

        let param = fieldParts.slice(0, i + 1).join('.');

        if (aggregationType === 'TERM') {
          if (i === fieldParts.length - 1) {
            param += '.raw';
          }
        }

        let name = fieldParts[i];
        if (i === 1) {
          name = 'goldenValues';
          aggregation.size = size;
        }

        aggregation.type = type;
        aggregation.name = name;
        aggregation.params = [param];

        if (i < fieldParts.length - 1) {
          aggregation.subAggregations = [{}];
          aggregation = aggregation.subAggregations[0];
        }
      }
    } else {
      aggregationRoot = {
        type: aggregationType,
        name: field,
        params: [field],
        size: size
      };
    }
    this.raw.aggregationList.push(aggregationRoot);

  }

  or(field: string) {
    field = this.prefixGolden(field);
    return new FilterStatement<T>(this, field, 'or');
  }

  and(field: string) {
    field = this.prefixGolden(field);
    return new FilterStatement<T>(this, field, 'and');
  }

  orderBy(field: string) {
    this.sort = this.prefixGolden(field);
    return this;
  }

  ascending() {
    this.sortOrder = 'ASC';
    return this;
  }

  descending() {
    this.sortOrder = 'DESC';
    return this;
  }

  private prefixGolden(field) {
    if (field.indexOf('.') === 0) {
      return 'mdmGoldenFieldAndValues' + field;
    }

    return field;
  }

  execute(): Promise<Response<T>> {

 
    if (!this.namedQuery) {
      const url = '/api/v1/queries/filter';

      const query = this.prepareQuery();
      const queryParams = this.prepareQueryParams();

      return httpClient.post(url, query, queryParams).then(
        (response: any) => {
          switch (this.aggregationType) {
            case 'COUNT': {
              const buckets = response.aggs.goldenValues.buckets;
              const resDto: CountResponse = {
                hits: response.hits,
                count: response.count,
                took: response.took,
                totalHits: response.totalHits,
                aggs: Object.keys(buckets).map(key => {
                  return {
                    key: key,
                    count: buckets[key].docCount
                  };
                })
              };

              return resDto;
            }
            default: {
              const resDto = new Response<T>();
              resDto.count = response.count;
              resDto.hits = response.hits;
              resDto.took = response.took;
              resDto.totalHits = response.totalHits;
              resDto.aggs = response.aggs;
              return resDto;
            }
          }
        }
      );

    } else {
      const queryParams = this.prepareQueryParams();

      const url = `/api/v2/queries/named/${this.namedQuery}`;
      return <Promise<Response<any>>> httpClient.post(url, this.namedQueryParams, queryParams);
    }

  }

  private deepFind(obj, path) {
    const paths = path.split('.');
    let current = obj;
    let i;

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] === undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  }

  private getDataModel(dataModel: any): string {
    if (typeof dataModel !== 'string') {
      return dataModel.prototype.constructor.dataModelName;
    }

    return dataModel;
  }

  private getNamedQuery(nq: any): string {
    if (typeof nq !== 'string') {
      return nq.prototype.constructor.namedQueryName;
    }

    return nq;
  }
}

export class Response<T> {
  hits: Array<T>;
  aggs: any;
  count: number;
  totalHits: number;
  took: number;
}

export class CountResponse extends Response<any> {
  aggs: {
    key: any;
    count: number;
  }[];
}
