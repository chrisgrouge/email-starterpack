# Email Starter-Pack
This repository is intended to be used as a boilerplate for starting new master-template email builds. 

## Getting Started

> ### **Before you get started**:
> You need to make sure that you have [git](https://git-scm.com/) and [node](https://nodejs.org/en/) installed on your machine. Whatever the latest version is should suffice.

### Open up your machines terminal

On a windows machine, powershell should do the trick

### Installing some packages globally onto your machine.

``` sh
$ npm install -g gulp-cli browser-sync

```
Installing these packages, gives you access to the `gulp` and `browser-sync` terminal commands (which you will need later). 

### Cloning the repository
``` sh
$ git clone https://github.com/h-jennings/email-starterpack.git [project-name]

```
> **Very Important Note:** Avoid cloning this repo into a OneDrive directory. This repo contains thousands of tiny files that are completely unnecessary once you're done with the development process, and **do not** need to be synced to the cloud.  

### Installing package dependencies
``` sh
$ npm install

```

>**Note:** Unless you are contributing to the repo, I would go ahead and get rid of any files related to git. **You may need to make hidden files on your machine visible to do this.**

### Starting the development/build process 

``` sh
$ gulp

```

### Exporting individual modules (no `data=""` attribute) 

``` sh
$ gulp get_njk_modules

```
- Pulls the individual nunjucks modules located in the `src/pages/modules` folder
- Runs them through various `gulp` functions
- After processed, drops them in the `dist/modules` folder
> I think that its best practice to name the modules in the `src/pages/modules` the same as the ones you reference in the `templates` folder and append a `cp_` before the module name.

_*see the `cp_example.njk` module for more clarification about file structure/requirements_ 

### Exporting individual modules (**with** `data=""` attribute) 

``` sh
$ gulp get_njk_modules_atr

```
- Same concept as the `get_njk_modules` command
- Main difference being is that a `data=""` is appended to every node with a `data-type=""` attribute on it.
- This is specifically for a Code Perfect 2.0 requirement. 

_*see the `cp_exampleWithAtr.njk` module for more clarification about file structure/requirements_ 