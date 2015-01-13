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

    $ sudo npm install grunt grunt-contrib-uglify grunt-sass grunt-contrib-watch grunt-phpunit --save-dev


Create `/Gruntfile.js`, with the following contents:

    //Gruntfile
    module.exports = function(grunt) {
      //Initializing the configuration object
      grunt.initConfig({
        // Paths variables
        paths: {
          // Development file locations (Where we put SASS files etc.)
          src: {
            css: './public/assets/scss/',
            js: './public/assets/js/',
            vendor: './public/assets/vendor/'
          },
          // Production file locationd where Grunt will output the files
          dest: {
            css: './public/stylesheets/',
            js: './public/js/'
          }
        },

        // Task configuration
        // compiling of SASS files
        sass: {
          options: {
            includePaths: ['<%= paths.src.vendor %>foundation/scss']
            //compass: true
          },
          dev: {
            files: {
              '<%= paths.dest.css %>app.css': '<%= paths.src.css %>app.scss'
            }
          },
          prod: {
            options: {
              // @link https://github.com/sindresorhus/grunt-sass#outputstyle
              outputStyle: 'compressed',
              sourceMap: true
            },
            files: {
              '<%= paths.dest.css %>app.min.css': '<%= paths.src.css %>app.scss'
            }
          }
        },
        uglify: {
          options: {
            compress: true,
            mangle: false // change to true if you want obfuscation (Changed variable names etc)
          },
          // minify JS files
          prod: {
            files: {
              '<%= paths.dest.js %>app.min.js': [
                '<%= paths.src.js %>app.js'
              ],
              '<%= paths.dest.js %>vendor.min.js': [
                '<%= paths.src.vendor %>jquery/dist/jquery.js',
                //'<%= paths.src.vendor %>jquery.cookie/jquery.cookie.js',
                '<%= paths.src.vendor %>jquery.placeholder/jquery.placeholder.js',
                '<%= paths.src.vendor %>fastclick/lib/fastclick.js',
                '<%= paths.src.vendor %>foundation/js/foundation.js'
              ]
            }
          }
        },
        phpunit: {
          //...
        },
        watch: {
          grunt: { files: ['Gruntfile.js'] },
          sass: {
            files: '<%= paths.src.css %>**/*.scss',
            tasks: ['sass:dev']
          },
          uglify: {
            files: '<%= paths.src.js %>**/*.js',
            tasks: ['uglify:prod']
          }
        }
      });

      // Plugin loading
      grunt.loadNpmTasks('grunt-sass');
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-contrib-uglify');

      // Task definition
      grunt.registerTask('build', ['sass:dev']);                    // create the dev files (SASS etc.)
      grunt.registerTask('release', ['sass:prod', 'uglify:prod']);  // create the release/production files
      grunt.registerTask('default', ['build','watch']);             // watch for changes and run dev builds
    };
