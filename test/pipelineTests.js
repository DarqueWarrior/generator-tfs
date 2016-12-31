const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`tfs:pipeline`, function () {
   it(`for azure should not compose with Docker`, function (done) {
      var deps = [
         // No docker gens are listed
         [helpers.createDummyGenerator(), `tfs:azure`],
         [helpers.createDummyGenerator(), `tfs:build`],
         [helpers.createDummyGenerator(), `tfs:release`]
      ];

      helpers.run(path.join(__dirname, `../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/defaultcollection`,
            `default`, `paas`, `AzureSub`, `AzureSubId`, `TenantId`, `servicePrincipalId`,
            ``, ``, ``, ``, ``, ``,
            `servicePrincipalKey`, `token`])
         .on(`error`, function (error) {
            console.log(`Oh Noes!`, error);
            done(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
         })
         .on(`end`, done);
   });

   it(`for docker should not compose with azure`, function (done) {
      var deps = [
         // No azure gens are listed
         [helpers.createDummyGenerator(), `tfs:build`],
         [helpers.createDummyGenerator(), `tfs:docker`],
         [helpers.createDummyGenerator(), `tfs:release`],
         [helpers.createDummyGenerator(), `tfs:registry`]
      ];

      helpers.run(path.join(__dirname, `../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withArguments([`node`, `nodeDemo`, `http://localhost:8080/tfs/defaultcollection`,
            `default`, `docker`, ``, ``, ``, ``,
            `DockerHost`, `DockerCert`, `DockerRegistry`, `DockerEmail`, `DockerPorts`, `DockerPassword`,
            ``, `token`])
         .on(`error`, function (error) {
            console.log(`Oh Noes!`, error);
            done(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
         })
         .on(`end`, done);
   });
});