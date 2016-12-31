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
   this.argument(`pat`, { type: String, required: false, desc: `the tfs Personal Access Token` });
}

function init() {
   // Store all the values collected from the command line so we can pass to 
   // sub generators. I also use this to determine which data I still need to
   // prompt for.
   cmdLnInput = {
      pat: this.pat,
      tfs: this.tfs,
      applicationName: this.applicationName
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
   }]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(a.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(a.tfs, cmdLnInput.tfs);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
   }.bind(this));
}

function configureTFS() {

   var done = this.async();

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      project: this.applicationName
   };

   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 1. Your initialization methods (checking current project state, getting configs, etc)
   initializing: init,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: configureTFS,

   // 4. default - If the method name doesn`t match a priority, it will be pushed to this group.

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: undefined,

   // 6. conflicts - Where conflicts are handled (used internally)

   // 7. Where installation are run (npm, bower)
   install: undefined,

   // 8. Called last, cleanup, say good bye, etc
   end: undefined
});