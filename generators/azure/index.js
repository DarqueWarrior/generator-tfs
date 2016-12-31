const app = require('./app.js');
const util = require(`../app/utility`);
const generators = require('yeoman-generator');

// Carry the arguments
var cmdLnInput = {};

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument('applicationName', { type: String, required: false, desc: 'the name of the application' });
   this.argument('tfs', { type: String, required: false, desc: 'the tfs from http to the collection i.e. http://localhost:8080/tfs/DefaultCollection' });
   this.argument('azureSub', { type: String, required: false, desc: 'the Azure Subscription name' });
   this.argument('azureSubId', { type: String, required: false, desc: 'the Azure Subscription ID' });
   this.argument('tenantId', { type: String, required: false, desc: 'the Azure Tenant ID' });
   this.argument('servicePrincipalId', { type: String, required: false, desc: 'the Azure Service Principal Id' });
   this.argument('servicePrincipalKey', { type: String, required: false, desc: 'the Azure Service Principal Key' });
   this.argument('pat', { type: String, required: false, desc: 'the tfs Personal Access Token' });
}

function init() {
   // Store all the values collected from the command line so we can pass to 
   // sub generators. I also use this to determine which data I still need to
   // prompt for.
   cmdLnInput = {
      pat: this.pat,
      tfs: this.tfs,
      azureSub: this.azureSub,
      tenantId: this.tenantId,
      azureSubId: this.azureSubId,
      applicationName: this.applicationName,
      servicePrincipalId: this.servicePrincipalId,
      servicePrincipalKey: this.servicePrincipalKey
   };
}

function input() {
   // Collect any missing data from the user.
   return this.prompt([{
      type: `input`,
      name: `tfs`,
      store: true,
      message: `What is your TFS URL including collection\n  i.e. http://tfs:8080/tfs/DefaultCollection?`,
      validate: util.validateTFS,
      when: function () {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      type: `password`,
      name: `pat`,
      store: false,
      message: `What is your TFS Access Token?`,
      validate: util.validatePersonalAccessToken,
      when: function () {
         return cmdLnInput.pat === undefined;
      }
   }, {
      type: `input`,
      name: `applicationName`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: function () {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `input`,
      name: `azureSub`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: function () {
         return cmdLnInput.azureSub === undefined;
      }
   }, {
      type: `input`,
      name: `azureSubId`,
      store: true,
      message: `What is your Azure subscription ID?`,
      validate: util.validateAzureSubID,
      when: function () {
         return cmdLnInput.azureSubId === undefined;
      }
   }, {
      type: `input`,
      name: `tenantId`,
      store: true,
      message: `What is your Azure Tenant ID?`,
      validate: util.validateAzureTenantID,
      when: function () {
         return cmdLnInput.tenantId === undefined;
      }
   }, {
      type: `input`,
      name: `servicePrincipalId`,
      store: true,
      message: `What is your Service Principal ID?`,
      validate: util.validateServicePrincipalID,
      when: function () {
         return cmdLnInput.servicePrincipalId === undefined;
      }
   }, {
      type: `password`,
      name: `servicePrincipalKey`,
      store: false,
      message: `What is your Service Principal Key?`,
      validate: util.validateServicePrincipalKey,
      when: function () {
         return cmdLnInput.servicePrincipalKey === undefined;
      }
   }]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(a.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(a.tfs, cmdLnInput.tfs);
      this.azureSub = util.reconcileValue(a.azureSub, cmdLnInput.azureSub);
      this.tenantId = util.reconcileValue(a.tenantId, cmdLnInput.tenantId);
      this.azureSubId = util.reconcileValue(a.azureSubId, cmdLnInput.azureSubId);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
      this.servicePrincipalId = util.reconcileValue(a.servicePrincipalId, cmdLnInput.servicePrincipalId);
      this.servicePrincipalKey = util.reconcileValue(a.servicePrincipalKey, cmdLnInput.servicePrincipalKey);
   }.bind(this));
}

function createServiceEndpoint() {

   var done = this.async();

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      azureSub: this.azureSub,
      tenantId: this.tenantId,
      azureSubId: this.azureSubId,
      appName: this.applicationName,
      servicePrincipalId: this.servicePrincipalId,
      servicePrincipalKey: this.servicePrincipalKey,
      project: this.applicationName
   };

   app.run(args, this, function (err) {

      if (err === null) {
         // TODO: Report error
      }

      done();
   });
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 1. Your initialization methods (checking current project state, getting configs, etc)
   initializing: init,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: undefined,

   // 4. default - If the method name doesn't match a priority, it will be pushed to this group.

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: createServiceEndpoint,

   // 6. conflicts - Where conflicts are handled (used internally)

   // 7. Where installation are run (npm, bower)
   install: undefined,

   // 8. Called last, cleanup, say good bye, etc
   end: undefined
});