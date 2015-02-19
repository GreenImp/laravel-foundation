# Steps

## Laravel

    $ laravel new site-name
    $ cd site-name


## Foundation

Install Foundation.

* Get files from Git repo: zurb/foundation-libsass-template)
* See [foundation-copy.md](foundation-copy.md) on what files to copy and where to


## Bower

Create `/.bowerrc`. See `/files/.bowerrc`

Run

    $ bower install


## Grunt

Install [Grunt](http://gruntjs.com/) and the required plugins:

    $ npm install grunt-contrib-uglify --save


Create `/Gruntfile.js`. See `/files/Gruntfile.js`


## Node

**I'M NOT SURE IF NPM init IS REQUIRED NOW**

    $ npm init -f

It will use the details in Foundation's package.json

**`npm install` will automatically install dependencies from `package.json` file**