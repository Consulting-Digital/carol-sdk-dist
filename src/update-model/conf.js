require('urlify').create({
  spaces: '-',
  nonPrintable: '-',
  toLower: true,
  extendString: true
});

const modelFolder = './src/model';
const dataModelsFolder = './src/model/data-models';
const namedQueriesFolder = './src/model/named-queries';

var conf = {
  modelFolder: modelFolder,
  dataModelsFolder: dataModelsFolder,
  namedQueriesFolder: namedQueriesFolder
};

module.exports = conf;
