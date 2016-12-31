const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const util = require(`../generators/app/utility`);
const project = require(`../generators/project/app`);

describe(`project:index cmdLine`, function () {
   var spawnStub;
   var utilTryFindProject;

   before(function (done) {
      helpers.run(path.join(__dirname, `../generators/project/index.js`))
         .withArguments([`unitTest`, `http://localhost:8080/tfs/DefaultCollection`, `token`])
         .on(`error`, function (error) {
            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);

            utilTryFindProject = sinon.stub(util, `tryFindProject`).callsArgWith(4, null, JSON.stringify({ name: `unitTest`, id: 1 }));
         })
         .on(`end`, function () {
            util.tryFindProject.restore();

            done();
         });
   });

   it(`git clone should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`git`, [`clone`, `http://localhost:8080/tfs/DefaultCollection/_git/unitTest`], { stdio: `pipe` }).callCount, `get clone was called`);
   });

   it(`git add should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`git`, [`add`, `--a`], { stdio: `pipe` }).callCount, `git add was called`);
   });

   it(`git commit should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`git`, [`commit`, `-m`, `Init`], { stdio: `pipe` }).callCount, `git commit was called`);
   });

   it(`website.json should not be generated`, function () {
      assert.noFile(`templates/website.json`);
   });

   it(`website.parameters.json should not be generated`, function () {
      assert.noFile(`templates/website.parameters.json`);
   });

   it(`parameters.xml should not be generated`, function () {
      assert.noFile(`templates/parameters.xml`);
   });
});

describe(`project:index prompts`, function () {
   var spawnStub;
   var utilTryFindProject;

   before(function (done) {
      helpers.run(path.join(__dirname, `../generators/project/index.js`))
         .withPrompts({
            applicationName: `unitTest`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            pat: `token`
         })
         .on(`error`, function (error) {
            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);

            utilTryFindProject = sinon.stub(util, `tryFindProject`).callsArgWith(4, null, JSON.stringify({ name: `unitTest`, id: 1 }));
         })
         .on(`end`, function () {
            util.tryFindProject.restore();

            done();
         });
   });

   it(`git clone should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`git`, [`clone`, `http://localhost:8080/tfs/DefaultCollection/_git/unitTest`], { stdio: `pipe` }).callCount, `get clone was called`);
   });

   it(`git add should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`git`, [`add`, `--a`], { stdio: `pipe` }).callCount, `git add was called`);
   });

   it(`git commit should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`git`, [`commit`, `-m`, `Init`], { stdio: `pipe` }).callCount, `git commit was called`);
   });

   it(`website.json should not be generated`, function () {
      assert.noFile(`templates/website.json`);
   });

   it(`website.parameters.json should not be generated`, function () {
      assert.noFile(`templates/website.parameters.json`);
   });

   it(`parameters.xml should not be generated`, function () {
      assert.noFile(`templates/parameters.xml`);
   });
});

describe(`project:app`, function () {
   "use strict";

   it(`run with existing project should run without error`, sinon.test(function (done) {
      // Arrange
      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         appName: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         target: `paas`,
         releaseJson: `releaseJson`
      };

      var logger = sinon.stub();
      logger.log = function () { };

      // findOrCreateProject
      // return so the code thinks the project was found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, JSON.stringify({ name: `e2eDemo`, id: 1 }));

      // Act
      project.run(args, logger, function (err, data) {
         // Assert
         assert.ok(!err);
         done();
      });
   }));

   it(`run with error should return error`, sinon.test(function (done) {
      // Arrange
      // return so the code thinks an error occurred 
      this.stub(util, `tryFindProject`).callsArgWith(4, new Error("boom"), null);

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         appName: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         target: `paas`,
         releaseJson: `releaseJson`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         project.run(args, logger);
      }, function (err) {
         done();
         return true;
      });
   }));

   it(`findOrCreateProject should create project`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/project/app`, { "request": requestStub });

      var logger = this.stub();
      logger.log = function () { };

      // Setup the stub. This stub will be called with two arguments.
      // The first is an options object and the second is a callback
      // that receives three args.
      // 1. the error object
      // 2. the response object
      // 3. the JSON response
      // Find or Create
      // return so the code thinks the project was not found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, undefined);
      // Create Project
      requestStub.onCall(0).yields(null, null, { name: `myProject`, url: `http://localhost:8080/tfs/_apis/projects/2` });
      // Check Status
      this.stub(util, `checkStatus`).callsArgWith(3, null, { status: `succeeded` });

      // Get Project
      requestStub.onCall(1).yields(null, { statusCode: 200 }, JSON.stringify({ name: `myProject`, id: `myProjectID` }));

      // Act
      proxyApp.findOrCreateProject(
         `http://localhost:8080/tfs/DefaultCollection`,
         `e2edemo`,
         `token`,
         logger,
         function (err, data) {
            // Assert
            assert.equal(`myProject`, data.name);
            assert.equal(`myProjectID`, data.id);

            done();
         });
   }));

   it(`findOrCreateProject should fail calling final GET`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/project/app.js`, { "request": requestStub });

      var logger = this.stub();
      logger.log = function () { };

      // Setup the stub. This stub will be called with two arguments.
      // The first is an options object and the second is a callback
      // that receives three args.
      // 1. the error object
      // 2. the response object
      // 3. the JSON response
      // Find or Create
      // return so the code thinks the project was not found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, undefined);

      // Create Project
      requestStub.onCall(0).yields(null, null, JSON.stringify({ name: `myProject` }));

      // Check Status
      this.stub(util, `checkStatus`).callsArgWith(3, null, { status: `succeeded` });

      // Get Project
      requestStub.onCall(1).yields({ message: `Error sending request` }, null, undefined);

      // Act
      proxyApp.findOrCreateProject(
         `http://localhost:8080/tfs/DefaultCollection`,
         `e2edemo`,
         `token`,
         logger,
         function (err, data) {
            // Assert
            assert.equal(`Error sending request`, err.message);

            done();
         });
   }));

   it(`findOrCreateProject should fail to find new project`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/project/app`, { "request": requestStub });

      var logger = this.stub();
      logger.log = function () { };
      logger.log.error = function () { };

      // Setup the stub. This stub will be called with two arguments.
      // The first is an options object and the second is a callback
      // that receives three args.
      // 1. the error object
      // 2. the response object
      // 3. the JSON response
      // Find or Create
      // return so the code thinks the project was not found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, undefined);

      // Create Project
      requestStub.onCall(0).yields(null, null, JSON.stringify({ name: `myProject` }));
      // Check Status
      this.stub(util, `checkStatus`).callsArgWith(3, null, { status: `succeeded` });

      // Get Project
      requestStub.onCall(1).yields(null, { statusCode: 404 }, null);

      // Act
      proxyApp.findOrCreateProject(
         `http://localhost:8080/tfs/DefaultCollection`,
         `e2edemo`,
         `token`,
         logger,
         function (err, data) {
            // Assert
            assert.equal(`Unable to find newly created project.`, err.message);

            done();
         });
   }));
});