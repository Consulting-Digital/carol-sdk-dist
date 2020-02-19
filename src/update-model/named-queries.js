const conf = require('./conf');
const fs = require('fs');
const rp = require('request-promise');

const logSymbols = require('log-symbols');

module.exports = function readNamedQueries (authToken) {
  console.log('Generating Named Queries');
  return rp.get(`${conf.baseUrl}/api/v1/namedQueries?pageSize=-1`, { headers: { authorization: authToken }}).then(response => {
    const namedQueries = JSON.parse(response).hits;

    namedQueries.forEach(namedQuery => {
      createFile(namedQuery);
    });

    console.log('Named Queries done!');
  });
}

function createFile (namedQuery) {
  const fileName = namedQuery.mdmQueryName.replace(/([A-Z])/g, ' $1').trim().urlify();
  const className = toTitleCase(namedQuery.mdmQueryName).replace(/\s/g, '');

  let fileContent =
`export class ${className} {
  static namedQueryName = '${namedQuery.mdmQueryName}';
}

export class ${className}Params {

  constructor(obj: ${className}Params) {
    if (obj) {
      Object.keys(obj).forEach(key => {
        this[key] = obj[key];
      });
    }
  }

`;

  namedQuery.mdmQueryParams.forEach(queryParam => {
    fileContent += `  ${queryParam.mdmName}${queryParam.mdmRequired? '' : '?'}: ${getDataType(queryParam.mdmValueType)};
`;

  });

  
  fileContent += 
`}
`;

  fs.appendFileSync(`${conf.namedQueriesFolder}/${fileName}.ts`, fileContent);
  console.log(`${logSymbols.success} Generated file: ${conf.namedQueriesFolder}/${fileName}.ts`);
}

function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1);
      }
  );
}

function getDataType(mdmMappingDataType) {
  switch (mdmMappingDataType) {
    case 'STRING': return 'string';
    case 'DATE': return 'Date';
    case 'BOOLEAN': return 'boolean';
    case 'DOUBLE': return 'number';
    default: return 'any';
  }
}
