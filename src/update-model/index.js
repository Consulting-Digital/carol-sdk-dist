const conf = require('./conf');

const fs = require('fs');
const rp = require('request-promise');

const readline = require('readline');
const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const readDataModels = require('./data-models');
const readNamedQueries = require('./named-queries');

reader.question('Url eg: "org.carol.ai": ', url => {
  reader.question('Environment: ', environment => {
    reader.question('Username: ', username => {
      reader.question('Password: ', password => {

        authenticate(url, environment, username, password).then(token => {
          clearModelFolder();
          Promise.all([
            readDataModels(token),
            readNamedQueries(token)
          ]).then(() => process.exit(0)).catch(e => {
            console.error(e);
            process.exit(1);
          });
        });

        reader.close();
      });
    });
  })
});



function authenticate (url, environment, username, password) {

  conf.baseUrl = `https://${url}`;
  console.log('conf.baseUrl: ' + conf.baseUrl)
  console.log({
    method: 'POST',
    uri: `${conf.baseUrl}/api/v1/oauth2/token`,
    form: {
      grant_type: 'password',
      username: username,
      password: password,
      subdomain: environment,
      connectorId: '0a0829172fc2433c9aa26460c31b78f0'
    }
  })
  
  return rp({
    method: 'POST',
    uri: `${conf.baseUrl}/api/v1/oauth2/token`,
    form: {
      grant_type: 'password',
      username: username,
      password: password,
      subdomain: environment,
      connectorId: '0a0829172fc2433c9aa26460c31b78f0'
    }
  }).then(res => {
    return JSON.parse(res).access_token;
  });
}

function clearModelFolder() {
  if (fs.existsSync(conf.modelFolder)) {
    rimraf(conf.modelFolder);
  }

  fs.mkdirSync(conf.modelFolder);
  fs.mkdirSync(conf.dataModelsFolder);
  fs.mkdirSync(conf.namedQueriesFolder);
}

function rimraf(path) {
  var files = [];

  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        rimraf(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
