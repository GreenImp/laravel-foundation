# Laravel and Foundation (libsass) installer

Reference: http://gabriela.io/blog/2014/08/10/laravel-with-grunt-bower-foundation-and-sass/


## Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Bower](http://bower.io): Run `[sudo] npm install -g bower`
  * [Grunt](http://gruntjs.com/): Run `[sudo] npm install -g grunt-cli`
  * [Composer](https://getcomposer.org/): See https://getcomposer.org/download/
  * PHP >= 5.4 and the following extensions:
    * [Mcrypt](http://php.net/manual/en/book.mcrypt.php)
    * [OpenSSL](http://php.net/manual/en/book.openssl.php)
    * [Mbstring](http://php.net/manual/en/book.mbstring.php)

Check the Laravel Server requirements for up-to-date information: http://laravel.com/docs/#server-requirements


### Installing Mcrypt
  * Mac: http://coolestguidesontheplanet.com/install-mcrypt-php-mac-osx-10-9-mavericks-development-server/
  * Windows: http://www.myoddweb.com/2010/11/18/install-mcrypt-for-php-on-windows/
  * More: http://stackoverflow.com/questions/24298722/error-script-php-artisan-clear-compiled-handling-the-post-install-cmd-event-ret



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


### Grunt

Install [Grunt](http://gruntjs.com/) and the required plugins:

    $ npm install grunt-contrib-uglify --save


Create `/Gruntfile.js`. See `/files/Gruntfile.js`


### Node

**I'M NOT SURE IF NPM init IS REQUIRED NOW**

    $ npm init -f

It will use the details in Foundation's package.json

**`npm install` will automatically install dependencies from `package.json` file**
