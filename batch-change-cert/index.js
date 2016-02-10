'use strict';

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('heroku_api_key', {
    alias: 'k',
    demand: true,
    describe: 'Heroku api key',
    type: 'string'
  })
  .option('certificate_chain', {
    alias: 'c',
    demand: true,
    describe: 'Public certificate chain file path, usually a .crt or .pem file',
    type: 'string'
  })
  .option('private_key', {
    alias: 'p',
    demand: true,
    describe: 'Private key file path, usually a .key file',
    type: 'string'
  })
  .option('app_type', {
    alias: 't',
    demand: false,
    default: 'all',
    describe: 'Application types to change the certificate',
    choices: ['all', 'staging', 'production']
  })
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2016 Emarsys')
  .argv;


const appType = argv.app_type;


const co = require('co');
const herokuClient = require('heroku-client');
const heroku = herokuClient.createClient({ token: argv.heroku_api_key });


const fs = require('fs');
const certificateChain = fs.readFileSync(argv.certificate_chain).toString();
const privateKey = fs.readFileSync(argv.private_key).toString();


const APP_FILTER_STAGING = /\-staging$|\-stage$/i;


let main = function* () {
  let apps  = yield heroku.apps().list();

  let filteredApps = apps.filter((app) => {
    if (appType === 'staging') {
      return APP_FILTER_STAGING.test(app.name);
    } else if (appType === 'production') {
      return !APP_FILTER_STAGING.test(app.name);
    }

    return true;
  });

  yield filteredApps.map((app) => {
    return heroku.apps(app.id).sslEndpoints(app.name + '.herokuapp.com').update({
      certificate_chain: certificateChain,
      private_key: privateKey,
      preprocess: true,
      rollback: false
    }).then(() => {
      console.log(`Updating certificate for ${app.name} is successfully completed!`);
    }).catch((err) => {
      if (err.statusCode === 404) {
        console.log(`There was no certificate to update for ${app.name}!`);
      } else {
        console.log(`There was an error while updated the certificate of ${app.name}!`, err);
      }
    });
  });
};

co(main);
