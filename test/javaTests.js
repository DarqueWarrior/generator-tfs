const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`tfs:java docker`, function () {
   var spawnStub;

   before(function (done) {
      helpers.run(path.join(__dirname, `../generators/java/index`))
         .withArguments([`javaUnitTest`, `docker`, `false`])
         .on(`error`, function (error) {
            console.log(`Oh Noes!`, error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         })
         .on(`end`, done);
   });

   it(`bower install should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`bower`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).callCount, `bower install was called`);
   });

   it(`files should be generated`, function () {
      assert.file([
         `javaUnitTest/.bowerrc`,
         `javaUnitTest/.gitignore`,
         `javaUnitTest/bower.json`,
         `javaUnitTest/Dockerfile`,
         `javaUnitTest/pom.xml`,
         `javaUnitTest/README.md`,
         `javaUnitTest/templates/website.json`,
         `javaUnitTest/templates/website.parameters.json`,
         `javaUnitTest/templates/parameters.xml`
      ]);

      assert.fileContent(`javaUnitTest/bower.json`, `"name": "javaunittest"`);
      assert.fileContent(`javaUnitTest/Dockerfile`, `ADD target/javaUnitTest.war /usr/local/tomcat/webapps/ROOT.war`);
      assert.fileContent(`javaUnitTest/templates/website.json`, `"javaVersion": "1.8"`);
      assert.fileContent(`javaUnitTest/templates/website.json`, `"javaContainer": "TOMCAT"`);
      assert.fileContent(`javaUnitTest/templates/website.json`, `"javaContainerVersion": "8.0"`);
   });
});

describe(`tfs:java paas`, function () {
   var bowerStub;

   before(function (done) {
      helpers.run(path.join(__dirname, `../generators/java/index`))
         .withArguments([`javaUnitTest`, `testGroupID`, `true`])
         .on(`error`, function (error) {
            console.log(`Oh Noes!`, error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            bowerStub = sinon.stub(generator, `spawnCommandSync`);
         })
         .on(`end`, done);
   });

   it(`bower install should be called`, function () {
      // Make sure the calls to install were made
      assert(bowerStub.withArgs(`bower`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).calledOnce, `bower install not called once`);
   });

   it(`files should be generated`, function () {
      assert.file([
         `.bowerrc`,
         `.gitignore`,
         `bower.json`,
         `Dockerfile`,
         `pom.xml`,
         `README.md`
      ]);

      assert.fileContent(`bower.json`, `"name": "javaunittest"`);
      assert.fileContent(`Dockerfile`, `ADD target/javaUnitTest.war /usr/local/tomcat/webapps/ROOT.war`);
   });
});