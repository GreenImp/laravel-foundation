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

If installed as a node module:

    $ laravel-foundation site-name

If downloaded from git repo:

    $ node /path/to/laravel-foundation site-name


While you're working on your project, run:

    $ grunt

And you're set!
