http://gabriela.io/blog/2014/08/10/laravel-with-grunt-bower-foundation-and-sass/

# Laravel

    $ laravel new site-name
    $ cd site-name
    $ npm init

Use the following details:

name : laravelTutorial

version : 0.1.0

description : This is a Laravel with Grunt, Bower, Foundation and Sass Tutorial made by @gabidavila: http://gabriela.io

entry point : Gruntfile.js

test command : `Enter`

git repository : git@github.com:gabidavila/laravel-grunt-bower-foundation.git

keywords : laravel, grunt, foundation, sass, bower

author : Gabriela D'Avila &lt;gabidavila&gt;

license : MIT


# Bower

Create `/.bowerrc`, with the following contents:

    {
      "directory": "public/assets/vendor"
    }

Create `bower.json`, with the following contents:

    {
      "name": "laravelTutorial"
    }


# Foundation

Install Foundation:

    $ bower install zurb/bower-foundation -S


## Required files

Installing Foundation only creates the Foundation files themselves. We now need to create our `app.scss`, `app.js` etc. files.

Create the required folders:

    $ mkdir public/assets/scss/
    $ public/assets/js

Create a copy of the Foundation `_settings.scss` file:

    $ cp public/assets/vendor/foundation/scss/foundation/_settings.scss public/assets/scss/_settings.scss

Create `/public/assets/scss/app.scss`, with the following contents:

    @import "settings";
    @import "foundation";

    // Or selectively include components
    // @import
    //   "foundation/components/accordion",
    //   "foundation/components/alert-boxes",
    //   "foundation/components/block-grid",
    //   "foundation/components/breadcrumbs",
    //   "foundation/components/button-groups",
    //   "foundation/components/buttons",
    //   "foundation/components/clearing",
    //   "foundation/components/dropdown",
    //   "foundation/components/dropdown-buttons",
    //   "foundation/components/flex-video",
    //   "foundation/components/forms",
    //   "foundation/components/grid",
    //   "foundation/components/inline-lists",
    //   "foundation/components/joyride",
    //   "foundation/components/keystrokes",
    //   "foundation/components/labels",
    //   "foundation/components/magellan",
    //   "foundation/components/orbit",
    //   "foundation/components/pagination",
    //   "foundation/components/panels",
    //   "foundation/components/pricing-tables",
    //   "foundation/components/progress-bars",
    //   "foundation/components/reveal",
    //   "foundation/components/side-nav",
    //   "foundation/components/split-buttons",
    //   "foundation/components/sub-nav",
    //   "foundation/components/switches",
    //   "foundation/components/tables",
    //   "foundation/components/tabs",
    //   "foundation/components/thumbs",
    //   "foundation/components/tooltips",
    //   "foundation/components/top-bar",
    //   "foundation/components/type",
    //   "foundation/components/offcanvas",
    //   "foundation/components/visibility";

This is the main scss file for the site.


Create `public/assets/js/app.js`, with the following contents:

    // Foundation JavaScript
    // Documentation can be found at: http://foundation.zurb.com/docs
    $(document).foundation();

This is the main js file for the site.


# Grunt

Install [Grunt](http://gruntjs.com/) and the required plugins

    $ sudo npm install grunt grunt-contrib-concat grunt-contrib-uglify grunt-phpunit grunt-contrib-compass grunt-contrib-sass grunt-copy --save-dev


Create `/Gruntfile.js`, with the following contents:

    //Gruntfile
    module.exports = function(grunt) {

    //Initializing the configuration object
    grunt.initConfig({
      // Paths variables
      paths: {
        // dev path files (scss etc.)
        dev: {
          css: './public/assets/scss/',
          js: './public/assets/js/',
          vendor: './public/assets/vendor/'
        },
        // Production where Grunt output the files
        production{
          css: './public/stylesheets/',
          js: './public/js/'
        }
      },

      // Task configuration
      concat: {
        //...
      },
      sass: {
        //...
      },
      uglify: {
        //...
      },
      phpunit: {
        //...
      },
      watch: {
        //...
      }
    });

    // Plugin loading

    // Task definition

    };
