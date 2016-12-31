const url = require(`url`);
const path = require(`path`);
const app = require(`./app.js`);
const util = require(`../app/utility`);
const generators = require(`yeoman-generator`);

// Carry the arguments
var cmdLnInput = {};

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { type: String, required: false, desc: `the name of the application` });
   this.argument(`tfs`, { type: String, required: false, desc: `the tfs from http to the collection i.e. http://localhost:8080/tfs/DefaultCollection` });
   this.argument(`dockerRegistryId`, { type: String, required: false, desc: `the ID for Docker repository` });
   this.argument(`dockerRegistryEmail`, { type: String, required: false, desc: `the email used with your Docker repository` });
   this.argument(`dockerRegistryPassword`, { type: String, required: false, desc: `the password for your Docker repository` });
   this.argument(`pat`, { type: String, required: false, desc: `the tfs Personal Access Token` });
}

// Store all the values collected from the command line so we can pass to 
// sub generators. I also use this to determine which data I still need to
// prompt for.
function init() {
   cmdLnInput = {
      pat: this.pat,
      tfs: this.tfs,
      applicationName: this.applicationName,
      dockerRegistryId: this.dockerRegistryId,
      dockerRegistryEmail: this.dockerRegistryEmail,
      dockerRegistryPassword: this.dockerRegistryPassword
   };
}

// Collect any missing data from the user.
function input() {
   return this.prompt([{
      type: `input`,
      name: `tfs`,
      store: true,
      message: "What is your TFS URL including collection\n  i.e. http://tfs:8080/tfs/DefaultCollection?",
      validate: util.validateTFS,
      when: function () {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      type: `password`,
      name: `pat`,
      store: false,
      message: "What is your TFS Access Token?",
      validate: util.validatePersonalAccessToken,
      when: function () {
         return cmdLnInput.pat === undefined;
      }
   }, {
      type: `input`,
      name: `applicationName`,
      store: true,
      message: "What is the name of your ASP.NET application?",
      validate: util.validateApplicationName,
      when: function () {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryId`,
      store: true,
      message: `What is your Docker Hub ID (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: function () {
         return cmdLnInput.dockerRegistryId === undefined;
      }
   }, {
      type: `password`,
      name: `dockerRegistryPassword`,
      store: false,
      message: `What is your Docker Hub password?`,
      validate: util.validateDockerHubPassword,
      when: function () {
         return cmdLnInput.dockerRegistryPassword === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryEmail`,
      store: true,
      message: `What is your Docker Hub email?`,
      validate: util.validateDockerHubEmail,
      when: function () {
         return cmdLnInput.dockerRegistryEmail === undefined;
      }
   }]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(a.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(a.tfs, cmdLnInput.tfs);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
      this.dockerRegistryId = util.reconcileValue(a.dockerRegistryId, cmdLnInput.dockerRegistryId);
      this.dockerRegistryEmail = util.reconcileValue(a.dockerRegistryEmail, cmdLnInput.dockerRegistryEmail);
      this.dockerRegistryPassword = util.reconcileValue(a.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword);
   }.bind(this));
}

function createServiceEndpoint() {
   var done = this.async();

   // We only support Docker Hub so set the dockerRegistry to 
   // https://index.docker.io/v1/
   var registry = "https://index.docker.io/v1/";

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      dockerRegistry: registry,
      appName: this.applicationName,
      project: this.applicationName,
      dockerRegistryId: this.dockerRegistryId,
      dockerRegistryEmail: this.dockerRegistryEmail,
      dockerRegistryPassword: this.dockerRegistryPassword
   };

   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 1. Your initialization methods (checking current project state, getting configs, etc)
   initializing: init,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: undefined,

   // 4. default - If the method name doesn`t match a priority, it will be pushed to this group.

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: createServiceEndpoint,

   // 6. conflicts - Where conflicts are handled (used internally)

   // 7. Where installation are run (npm, bower)
   install: undefined,

   // 8. Called last, cleanup, say good bye, etc
   end: undefined
});