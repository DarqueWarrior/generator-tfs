// This is the code that deals with TFS
const async = require('async');
const request = require('request');
const util = require('../app/utility');

const SERVICE_ENDPOINTS_API_VERSION = '3.0-preview.1';

function run(args, gen, done) {
   'use strict';

   var azureSub = {
      id: args.azureSubId,
      name: args.azureSub,
      tenantId: args.tenantId,
      servicePrincipalId: args.servicePrincipalId,
      servicePrincipalKey: args.servicePrincipalKey
   };
   var teamProject = {};
   var token = util.encodePat(args.pat);

   async.series([
      function (mainSeries) {
         util.findProject(args.tfs, args.project, token, gen, function (err, tp) {
            teamProject = tp;
            mainSeries(err, tp);
         });
      },
      function (mainSeries) {
         findOrCreateAzureServiceEndpoint(args.tfs, teamProject.id, azureSub, token, gen, mainSeries);
      }],
      function (err, results) {
         // This is just for test and will be undefined during normal use
         if (done) {
            done(err);
         }

         if (err) {
            // To get the stacktrace run with the --debug built-in option when 
            // running the generator.
            gen.env.error(err.message);
         }
      });
}

function findOrCreateAzureServiceEndpoint(account, projectId, sub, token, gen, callback) {
   'use strict';

   util.tryFindAzureServiceEndpoint(account, projectId, sub, token, gen, function (e, ep) {
      if (e) {
         // An error occured trying to contact TFS
         callback(e, null);
      } else {
         // TFS responded
         if (ep === undefined) {
            // The endpoint was not found so create it
            createAzureServiceEndpoint(account, projectId, sub, token, gen, callback);
         } else {
            gen.log(`+ Found Azure Service Endpoint '${sub.name}'`);
            callback(e, ep);
         }
      }
   });
}

function createAzureServiceEndpoint(account, projectId, sub, token, gen, callback) {
   'use strict';

   gen.log(`+ Creating ${sub.name} Azure Service Endpoint`);

   var options = {
      method: 'POST',
      headers: {
         'cache-control': 'no-cache',
         'content-type': 'application/json',
         'authorization': `Basic ${token}`
      },
      json: true,
      url: `${account}/${projectId}/_apis/distributedtask/serviceendpoints`,
      qs: {
         'api-version': SERVICE_ENDPOINTS_API_VERSION
      },
      body: {
         authorization: {
            parameters: {
               serviceprincipalid: sub.servicePrincipalId,
               serviceprincipalkey: sub.servicePrincipalKey,
               tenantid: sub.tenantId
            },
            scheme: 'ServicePrincipal'
         },
         data: {
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            creationMode: 'Manual'
         },
         name: sub.name,
         type: 'azurerm',
         url: 'https://management.core.windows.net/'
      }
   };

   request(options, function (err, response, obj) {
      callback(err, obj);
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   findOrCreateAzureServiceEndpoint: findOrCreateAzureServiceEndpoint
};