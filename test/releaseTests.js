const fs = require(`fs`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const proxyquire = require(`proxyquire`);
const util = require(`../generators/app/utility`);
const release = require(`../generators/release/app`);

describe(`release`, function () {
   "use strict";

   it(`run with existing release should run without error`, sinon.test(function (done) {
      // Arrange
      // callsArgWith uses the first argument as the index of the callback function
      // to call and calls it with the rest of the arguments provided.
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `tryFindRelease`).callsArgWith(1, null, { value: "I`m a release." });
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `findBuild`).callsArgWith(4, null, { value: "I`m a build.", id: 1, authoredBy: { id: 1, displayName: `displayName`, uniqueName: `uniqueName` } });
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, { value: "I`m an endpoint.", id: 1 });

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         buildJson: `buildJson`,
         target: `paas`,
         dockerHost: `dockerHost`,
         dockerRegistry: `dockerRegistry`,
         dockerRegistryId: `dockerRegistryId`
      };

      // Act
      release.run(args, logger, function (e, ep) {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with error should return error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `tryFindRelease`).callsArgWith(1, new Error("boom"), null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `findBuild`).callsArgWith(4, null, { value: "I`m a build.", id: 1, authoredBy: { id: 1, displayName: `displayName`, uniqueName: `uniqueName` } });
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, null);

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         buildJson: `buildJson`,
         target: `docker`,
         dockerHost: `dockerHost`,
         dockerRegistry: `dockerRegistry`,
         dockerRegistryId: `dockerRegistryId`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         release.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateRelease should create release paas`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/release/app`, { "request": requestStub });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindRelease`).callsArgWith(1, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{ReleaseDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `findBuild`).callsArgWith(4, null, { value: "I`m a build.", id: 1, authoredBy: { id: 1, displayName: `displayName`, uniqueName: `uniqueName` } });
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, { value: "I`m an endpoint.", id: 1 });

      var logger = sinon.stub();
      logger.log = function () { };

      // Create release
      requestStub.onCall(0).yields(null, { statusCode: 200 }, { name: `release` });

      var args = {
         build: { id: 1, name: `e2eDemo-CI` },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         endpoint: `endpoint`,
         teamProject: { name: `teamProject`, id: 1 },
         approverUniqueName: `approverUniqueName`,
         approverDisplayName: `approverDisplayName`,
         target: `paas`
      };

      // Act
      proxyApp.findOrCreateRelease(args, logger, function (e, rel) {
         assert.equal(e, null);
         assert.equal(rel.name, `release`);

         done();
      });
   }));

   it(`findOrCreateRelease should create release docker`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/release/app`, { "request": requestStub });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindRelease`).callsArgWith(1, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{ReleaseDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `findBuild`).callsArgWith(4, null, { value: "I`m a build.", id: 1, authoredBy: { id: 1, displayName: `displayName`, uniqueName: `uniqueName` } });
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, null);

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         build: { id: 1, name: `e2eDemo-CI` },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         endpoint: `endpoint`,
         teamProject: { name: `teamProject`, id: 1 },
         approverUniqueName: `approverUniqueName`,
         approverDisplayName: `approverDisplayName`,
         target: `docker`,
         dockerPorts: `80:80`,
         dockerRegistryId: `dockerRegistryId`,
         dockerRegistryEndpoint: `dockerRegistryEndpoint`
      };

      // Create release
      requestStub.onCall(0).yields(null, { statusCode: 403 }, undefined);
      requestStub.onCall(1).yields(null, { statusCode: 200 }, { name: `release` });

      // Act
      proxyApp.findOrCreateRelease(args, logger, function (e, rel) {
            assert.equal(e, null);
            assert.equal(rel.name, `release`);

            done();
         });
   }));

   it(`findOrCreateRelease should return error if release create fails`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/release/app`, { "request": requestStub });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindRelease`).callsArgWith(1, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{ReleaseDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `findBuild`).callsArgWith(4, null, { value: "I`m a build.", id: 1, authoredBy: { id: 1, displayName: `displayName`, uniqueName: `uniqueName` } });
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, { value: "I`m an endpoint.", id: 1 });

      var logger = sinon.stub();
      logger.log = function () { };

      // Create release
      requestStub.onCall(0).yields(null, { statusCode: 400 }, undefined);

      var args = {
         build: { id: 1, name: `e2eDemo-CI` },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         endpoint: `endpoint`,
         teamProject: { name: `teamProject`, id: 1 },
         approverUniqueName: `approverUniqueName`,
         approverDisplayName: `approverDisplayName`,
         target: `docker`,
         dockerPorts: `80:80`,
         dockerHostEndpoint: { id: 1 },
         dockerRegistryId: `dockerRegistryId`,
         dockerRegistryEndpoint: `dockerRegistryEndpoint`
      };

      // Act
      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         proxyApp.findOrCreateRelease(args, logger, done);
      }, function (e) {
         done();
         return true;
      });
   }));
});