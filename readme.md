# Laravel and Foundation (libsass) installer

Reference: http://gabriela.io/blog/2014/08/10/laravel-with-grunt-bower-foundation-and-sass/


## Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Grunt](http://gruntjs.com/): Run `[sudo] npm install -g grunt-cli`
  * [Bower](http://bower.io): Run `[sudo] npm install -g bower`


## Quickstart

    $ laravel-foundation site-name

While you're working on your project, run:

    $ grunt

And you're set!



## Steps

### Laravel

    $ laravel new site-name
    $ cd site-name


### Foundation

Install Foundation.

* Get files from Git repo: zurb/foundation-libsass-template)
* See [foundation-copy.md](foundation-copy.md) on what files to copy and where to


### Bower

Create `/.bowerrc`. See `/files/.bowerrc`

Run

    $ bower install


### Node

**I'M NOT SURE IF NPM IS REQUIRED NOW. This may install the grunt dependancies**

    $ npm init -f

It will use the details in Foundation's package.json


### Grunt

Install [Grunt](http://gruntjs.com/) and the required plugins

    $ sudo npm install grunt grunt-contrib-uglify

**See how to automatically install dependencies from `package.json` file**


Create `/Gruntfile.js`. See `/files/Gruntfile.js`
