const sinon = require(`sinon`);
const assert = require(`assert`);
const proxyquire = require(`proxyquire`);
const util = require(`../generators/app/utility`);
const azure = require(`../generators/azure/app`);

describe(`azure`, function () {
   "use strict";

   it(`run with existing endpoint should run without error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, { name: `endpoint`, id: 1 });

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         servicePrincipalId: `servicePrincipalId`,
         queue: `Default`,
         azureSub: `AzureSub`,
         azureSubId: `azureSubId`,
         tenantId: `tenantId`,
         servicePrincipalKey: `servicePrincipalKey`
      };

      // Act
      azure.run(args, logger, function (e, ep) {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with error should return error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, new Error("boom"), null);

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         servicePrincipalId: `servicePrincipalId`,
         queue: `Default`,
         azureSub: `AzureSub`,
         azureSubId: `azureSubId`,
         tenantId: `tenantId`,
         servicePrincipalKey: `servicePrincipalKey`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         azure.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateAzureServiceEndpoint should create endpoint`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/azure/app`, { "request": requestStub });

      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, undefined);

      var logger = sinon.stub();
      logger.log = function () { };

      // Create Project
      requestStub.onCall(0).yields(null, null, { name: `endpoint` });

      // Act
      proxyApp.findOrCreateAzureServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`, `ProjectId`,
         { name: `SubName` }, `token`, logger, function (e, ep) {
            assert.equal(e, null);
            assert.equal(ep.name, `endpoint`);

            done();
         });
   }));
});