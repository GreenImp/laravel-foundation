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
        css: './public/css/',
        js: './public/js/'
      }
    },

    // Task configuration
    // compiling of SASS files
    sass: {
      dev: {
        options: {
          compass: true
        },
        files: [{
          expand: true,
          cwd: '<%= paths.src.css %>',
          src: '**/*.scss',
          dest: '<%= paths.dest.css %>',
          ext: '.css'
        }]
      },
      prod: {
        options: {
          style: 'compressed',
          compass: true
        },
        files: [{
          expand: true,
          cwd: '<%= paths.src.css %>',
          src: '**/*.scss',
          dest: '<%= paths.dest.css %>',
          ext: '.min.css'
        }]
      }
    },
    concat: {
      // concates JS files
      prod: {
        options: {
          separator: ';'
        },
        js_header: {
          src: [
            '<%= paths.src.vendor %>modernizr/modernizr.js'
          ],
          dest: '<%= paths.dest.js %>header.js'
        },
        js_footer: {
          src: [
            '<%= paths.src.vendor %>jquery/dist/jquery.js',
            //'<%= paths.src.vendor %>jquery.cookie/jquery.cookie.js',
            '<%= paths.src.vendor %>jquery.placeholder/jquery.placeholder.js',
            '<%= paths.src.vendor %>fastclick/lib/fastclick.js',
            '<%= paths.src.vendor %>foundation/js/foundation.js',
            '<%= paths.src.js %>app.js'
          ],
          dest: '<%= paths.dest.js %>footer.js'
        }
      }
    },
    uglify: {
      // minifies JS
      prod: {
        options: {
          mangle: false // change to true if you want obfuscation (Changed variable names etc)
        },
        // minify JS files
        js: {
          files: [{
            expand: true,
            cwd: '<%= paths.dest.js %>',
            src: '*.js',
            dest: '<%= paths.dest.js %>',
            ext: '.min.js'
          }]
        }
      }
    },
    // Copy dev versions of the JS files
    copy: {
      dev: {
        files: {
          expand: true,
          cwd: '<%= paths.src.js %>',
          src: '**/*',
          dest: '<%= paths.dest.js %>dev'
        }
      }
    },
    phpunit: {
      //...
    },
    watch: {
      //...
    }
  });

  // Plugin loading
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-copy');

  // Task definition
  grunt.registerTask( // default task - create dev versions of files
    'default',
    ['sass:dev', 'copy:dev']
  );

  grunt.registerTask( // release task - creates the production version of files
    'release',
    ['sass:prod', 'concat:prod', 'uglify:prod']
  );
};