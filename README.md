# rally-accessible-app #

An accessible way of interacting with Rally.  We're working on this as an example of an app that can be used by JAWS.  
We recommend Firefox.  Lots of interesting problems with Internet Explorer.

## Setting Up To Develop ##

We're moving from rake over to grunt.  The advantage of a building system is that we can divide the product into 
separate files (JS, CSS) that are combined together into a single HTML file that gets put into the panel in Rally.
(Apps live inside iframes, so they are basically html files with JS.)  Also, we can create a debug version that 
doesn't have to be copied in on every change while developing.

To develop, you'll need to set up an environment, following these steps (in detail below):
1.  Install git and download the source
2.  Install node.js.  Node.js provides a runtime environment and a bunch of other packaging tools useful for the building and testing process.
3.  Install grunt.  Think of grunt as a JavaScript makefile.


1.  Install git
We use github as our version control system.  If you're not a Rally developer, you'll want to fork the repository and then make a clone locally.  Follow the instructions on github.

2.  Install node.js
This really is as simple as going to http://nodejs.org/ and pushing the Install button.  Afterward, type this command to see that it installed:
`npm --version`

3.  Install grunt
From the command line, use the node package manager to install grunt.  On linux/mac, you might have to use sudo as shown below. On Windows, you will not use the sudo part of the command.
`sudo npm install -g grunt-cli
sudo npm install -g grunt-init`

4. Change directories to the root of this project and locally install grunt.  I'm not sure what this does.
`npm install grunt`

5. Locally install additional dependencies: grunt-templater, and underscore:
`npm install grunt-templater
 npm install underscore`


## Developing ##

### Grunt ###
The gruntfile has two tasks.  To run a task, type `grunt <task name>`.  For example:
`grunt debug`

The default task will run if you don't provide a task name.

*default* Creates a version of the html file (in the deploy directory) that must be cut and pasted into the App panel in Rally.
*debug* Creates a version of the html file (at project root) that can be loaded into a browser and refreshed to test whenever you change the JS files.  (You still have to log into Rally in another browser tab.)

### config.json ###
This file provides a few configuration settings for the app you are creating.  Change the server and sdk settings when developing against a different sdk or testing on another server.  The javascript and css settings are no longer required -- they're historical -- because the gruntfile just pulls the list of JS files from the src directory.



