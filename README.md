# This project is no longer maintained.
## This project has been superseded by [yo Team](https://github.com/DarqueWarrior/generator-team)

# generator-tfs

## Build status
![](https://dlb.visualstudio.com/_apis/public/build/definitions/40202688-4713-4e5d-85ea-958146d71db6/53/badge)

## See it in action
[Ignite New Zealand 2016](https://channel9.msdn.com/Events/Ignite/New-Zealand-2016/M328?WT.mc_id=devops-0000-dbrown)

## Capabilities
generator-tfs is a [Yeoman](http://yeoman.io/) generator that creates a complete CI/CD pipeline in [Visual Studio Team Services](https://www.visualstudio.com/tfs-test/?WT.mc_id=devops-0000-dbrown) for the following languages:
- Java using Tiles and bootstrap
- Node using Pug and bootstrap
- ASP.net Core using Razor and bootstrap

It allows you to deploy to the following platforms:
- [Azure App Service](https://azure.microsoft.com/services/app-service/web/?WT.mc_id=devops-0000-dbrown)
- [Docker](https://www.docker.com/)

## Requirements
- [Team Foundation Server 2017](https://www.visualstudio.com/downloads/?WT.mc_id=devops-0000-dbrown)
   - [Personal Access Token](https://www.visualstudio.com/docs/setup-admin/team-services/use-personal-access-tokens-to-authenticate?WT.mc_id=devops-0000-dbrown)
   - Install [Docker Integration](https://marketplace.visualstudio.com/items?itemName=ms-vscs-rm.docker&WT.mc_id=devops-0000-dbrown) on tfs Account
- [Azure Subscription](https://azure.microsoft.com/free/?WT.mc_id=devops-0000-dbrown)
   - [Service Principal](http://donovanbrown.com/post/Creating-an-Azure-Resource-Manager-Service-Endpoint-in-new-Portal)
- [Node.js](http://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Bower](https://bower.io/)
- [Azure PowerShell](https://azure.microsoft.com/downloads/?WT.mc_id=devops-0000-dbrown)
- [Git](http://git-scm.org/)
- [.NET Core SDK](http://dot.net)
- [.NET Framework 3.5](https://www.microsoft.com/download/details.aspx?id=21&WT.mc_id=devops-0000-dbrown)
- [Maven](http://maven.apache.org/)
- [Java JDK & JRE](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
- [Docker Toolbox](https://github.com/docker/toolbox/releases)

## Install
You can read how to use it at [DonovanBrown.com](http://www.donovanbrown.com/post/yo-TFS). 

## To test
`npm test`

## Debug
You can debug the generator using [VS Code](https://code.visualstudio.com/?WT.mc_id=devops-0000-dbrown). You need to update the launch.json. Replace any value in [] with your information.  Use [npm link](https://docs.npmjs.com/cli/link) from the root folder to load your local version.
