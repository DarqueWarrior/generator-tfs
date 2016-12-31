// This is the main entry point of the generator.  The heavy lifting is done in the
// sub generators.  I separated them so I could compose with language generators.
const url = require(`url`);
const yosay = require(`yosay`);
const util = require(`./utility`);
const generators = require(`yeoman-generator`);

// Carry the arguments
var cmdLnInput = {};

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important
   // These are position based arguments for this generator. If they are not provided
   // via the command line they will be queried during the prompting priority
   this.argument(`type`, { type: String, required: false, desc: `the project type to create (asp, node or java)` });
   this.argument(`applicationName`, { type: String, required: false, desc: `the name of the application` });
   this.argument(`tfs`, { type: String, required: false, desc: `the tfs from http to the collection i.e. http://localhost:8080/tfs/DefaultCollection` });
   this.argument(`azureSub`, { type: String, required: false, desc: `the Azure Subscription name` });
   this.argument(`azureSubId`, { type: String, required: false, desc: `the Azure Subscription ID` });
   this.argument(`tenantId`, { type: String, required: false, desc: `the Azure Tenant ID` });
   this.argument(`servicePrincipalId`, { type: String, required: false, desc: `the Azure Service Principal Id` });
   this.argument(`queue`, { type: String, required: false, desc: `the agent queue name to use` });
   this.argument(`target`, { type: String, required: false, desc: `docker or Azure app service` });
   this.argument(`installDep`, { type: String, required: false, desc: `if true dependencies are installed` });
   this.argument(`groupId`, { type: String, required: false, desc: `the groupId of Java project` });
   this.argument(`dockerHost`, { type: String, required: false, desc: `the Docker host url including port` });
   this.argument(`dockerCertPath`, { type: String, required: false, desc: `the path to Docker certs folder` });
   this.argument(`dockerRegistryId`, { type: String, required: false, desc: `the ID for Docker repository` });
   this.argument(`dockerRegistryEmail`, { type: String, required: false, desc: `the email used with your Docker repository` });
   this.argument(`dockerPorts`, { type: String, required: false, desc: `the port mapping for container and host` });
   this.argument(`dockerRegistryPassword`, { type: String, required: false, desc: `the password for your Docker repository` });
   this.argument(`servicePrincipalKey`, { type: String, required: false, desc: `the Azure Service Principal Key` });
   this.argument(`pat`, { type: String, required: false, desc: `the tfs Personal Access Token` });
}

function init() {
   // Store all the values collected from the command line so we can pass to 
   // sub generators. I also use this to determine which data I still need to
   // prompt for.

   this.log(yosay(`Welcome to DevOps powered by Team Foundation Server`));
   cmdLnInput = {
      pat: this.pat,
      type: this.type,
      tfs: this.tfs,
      queue: this.queue,
      target: this.target,
      groupId: this.groupId,
      azureSub: this.azureSub,
      tenantId: this.tenantId,
      azureSubId: this.azureSubId,
      installDep: this.installDep,
      dockerHost: this.dockerHost,
      dockerPorts: this.dockerPorts,
      dockerCertPath: this.dockerCertPath,
      applicationName: this.applicationName,
      dockerRegistryId: this.dockerRegistryId,
      servicePrincipalId: this.servicePrincipalId,
      servicePrincipalKey: this.servicePrincipalKey,
      dockerRegistryEmail: this.dockerRegistryEmail,
      dockerRegistryPassword: this.dockerRegistryPassword
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
      type: `list`,
      name: `queue`,
      store: true,
      message: `What agent queue would you like to use?`,
      default: `Default`,
      choices: util.getPools,
      when: function () {
         return cmdLnInput.queue === undefined;
      }
   }, {
      type: `list`,
      name: `type`,
      store: true,
      message: `What type of application do you want to create?`,
      default: cmdLnInput.type,
      choices: [{
         name: `.NET Core`,
         value: `asp`
      }, {
         name: `Node.js`,
         value: `node`
      }, {
         name: `Java`,
         value: `java`
      }],
      when: function () {
         return cmdLnInput.type === undefined;
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
      type: `list`,
      name: `target`,
      store: true,
      message: `Where would you like to deploy?`,
      choices: [{
         name: `Azure App Service`,
         value: `paas`
      }, {
         name: `Docker`,
         value: `docker`
      }],
      when: function () {
         return cmdLnInput.target === undefined;
      }
   }, {
      type: `input`,
      name: `azureSub`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: function (a) {
         return (a.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.azureSub === undefined;
      }
   }, {
      type: `input`,
      name: `azureSubId`,
      store: true,
      message: `What is your Azure subscription ID?`,
      validate: util.validateAzureSubID,
      when: function (a) {
         return (a.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.azureSubId === undefined;
      }
   }, {
      type: `input`,
      name: `tenantId`,
      store: true,
      message: `What is your Azure Tenant ID?`,
      validate: util.validateAzureTenantID,
      when: function (a) {
         return (a.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.tenantId === undefined;
      }
   }, {
      type: `input`,
      name: `servicePrincipalId`,
      store: true,
      message: `What is your Service Principal ID?`,
      validate: util.validateServicePrincipalID,
      when: function (a) {
         return (a.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.servicePrincipalId === undefined;
      }
   }, {
      type: `password`,
      name: `servicePrincipalKey`,
      store: false,
      message: `What is your Service Principal Key?`,
      validate: util.validateServicePrincipalKey,
      when: function (a) {
         return (a.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.servicePrincipalKey === undefined;
      }
   }, {
      type: `input`,
      name: `dockerHost`,
      store: true,
      message: `What is your Docker host url and port (tcp://host:2376)?`,
      validate: util.validateDockerHost,
      when: function (answers) {
         // If you pass in the target on the command line 
         // answers.target will be undefined so test cmdLnInput
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerHost === undefined;
      }
   }, {
      type: `input`,
      name: `dockerCertPath`,
      store: true,
      message: `What is your Docker Certificate Path?`,
      validate: util.validateDockerCertificatePath,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerCertPath === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryId`,
      store: true,
      message: `What is your Docker Hub ID (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistryId === undefined;
      }
   }, {
      type: `password`,
      name: `dockerRegistryPassword`,
      store: false,
      message: `What is your Docker Hub password?`,
      validate: util.validateDockerHubPassword,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistryPassword === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryEmail`,
      store: true,
      message: `What is your Docker Hub email?`,
      validate: util.validateDockerHubEmail,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistryEmail === undefined;
      }
   }, {
      type: `input`,
      name: `dockerPorts`,
      default: util.getDefaultPortMapping,
      message: `What should the port mapping be?`,
      validate: util.validatePortMapping,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerPorts === undefined;
      }
   }, {
      type: `input`,
      name: `groupId`,
      store: true,
      message: "What is your Group ID?",
      validate: util.validateGroupID,
      when: function (answers) {
         return answers.type === `java` && cmdLnInput.groupId === undefined;
      }
   }, {
      type: `list`,
      name: `installDep`,
      store: true,
      message: "Install dependencies?",
      default: `false`,
      choices: [
         {
            name: `Yes`,
            value: `true`
         },
         {
            name: `No`,
            value: `false`
         }
      ],
      when: function () {
         return cmdLnInput.installDep === undefined;
      }
   }]).then(function (a) {
      // Transfer answers to global object for use in the rest of the generator
      this.pat = util.reconcileValue(a.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(a.tfs, cmdLnInput.tfs);
      this.type = util.reconcileValue(a.type, cmdLnInput.type);
      this.queue = util.reconcileValue(a.queue, cmdLnInput.queue);
      this.target = util.reconcileValue(a.target, cmdLnInput.target);
      this.groupId = util.reconcileValue(a.groupId, cmdLnInput.groupId, ``);
      this.azureSub = util.reconcileValue(a.azureSub, cmdLnInput.azureSub, ``);
      this.tenantId = util.reconcileValue(a.tenantId, cmdLnInput.tenantId, ``);
      this.installDep = util.reconcileValue(a.installDep, cmdLnInput.installDep);
      this.azureSubId = util.reconcileValue(a.azureSubId, cmdLnInput.azureSubId, ``);
      this.dockerHost = util.reconcileValue(a.dockerHost, cmdLnInput.dockerHost, ``);
      this.dockerPorts = util.reconcileValue(a.dockerPorts, cmdLnInput.dockerPorts, ``);
      this.dockerCertPath = util.reconcileValue(a.dockerCertPath, cmdLnInput.dockerCertPath, ``);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(a.dockerRegistryId, cmdLnInput.dockerRegistryId, ``);
      this.servicePrincipalId = util.reconcileValue(a.servicePrincipalId, cmdLnInput.servicePrincipalId, ``);
      this.servicePrincipalKey = util.reconcileValue(a.servicePrincipalKey, cmdLnInput.servicePrincipalKey, ``);
      this.dockerRegistryEmail = util.reconcileValue(a.dockerRegistryEmail, cmdLnInput.dockerRegistryEmail, ``);
      this.dockerRegistryPassword = util.reconcileValue(a.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword, ``);
   }.bind(this));
}

function configGenerators() {
   // Based on the users answers compose all the required generators.

   if (this.type === `asp`) {
      this.composeWith(`tfs:asp`, { args: [this.applicationName, this.installDep] });
   } else if (this.type === `java`) {
      this.composeWith(`tfs:java`, { args: [this.applicationName, this.groupId, this.installDep] });
   } else {
      this.composeWith(`tfs:node`, { args: [this.applicationName, this.installDep] });
   }

   this.composeWith(`tfs:git`, {
      args: [this.applicationName, this.tfs,
         `all`,
      this.pat]
   });

   if (this.target === `docker`) {
      this.composeWith(`tfs:docker`, {
         args: [this.applicationName, this.tfs,
         this.dockerHost, this.dockerCertPath, this.dockerRegistryId, this.dockerRegistryEmail, this.dockerPorts, this.dockerRegistryPassword,
         this.pat]
      });

      this.composeWith(`tfs:registry`, {
         args: [this.applicationName, this.tfs,
         this.dockerRegistryId, this.dockerRegistryEmail, this.dockerRegistryPassword,
         this.pat]
      });
   }

   if (this.target === `paas`) {
      this.composeWith(`tfs:azure`, {
         args: [this.applicationName, this.tfs,
         this.azureSub, this.azureSubId, this.tenantId, this.servicePrincipalId, this.servicePrincipalKey,
         this.pat]
      });
   }

   this.composeWith(`tfs:build`, {
      args: [this.type, this.applicationName, this.tfs,
      this.queue, this.target,
      this.dockerHost, this.dockerRegistryId,
      this.pat]
   });

   this.composeWith(`tfs:release`, {
      args: [this.type, this.applicationName, this.tfs,
      this.queue, this.target,
      this.azureSub, 
      this.dockerHost, this.dockerRegistryId, this.dockerPorts,
      this.pat]
   });

   this.composeWith(`tfs:project`, {
      args: [this.applicationName, this.tfs,
      this.pat]
   });
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 1. Your initialization methods (checking current project state, getting configs, etc)
   initializing: init,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: configGenerators,

   // 4. default - If the method name doesn`t match a priority, it will be pushed to this group.

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: undefined,

   // 6. conflicts - Where conflicts are handled (used internally)

   // 7. Where installation are run (npm, bower)
   install: undefined,

   // 8. Called last, cleanup, say good bye, etc
   end: undefined
});