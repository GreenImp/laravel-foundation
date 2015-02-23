module.exports = function(grunt) {
  // Initializing the configuration object
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // Paths variables
    paths: {
      // Development file locations, where we put SASS files etc.
      src: {
        css: './assets/scss/',
        js: './assets/js/',
        vendor: './assets/vendor/'
      },
      // Production file locations, where Grunt will output the files
      dest: {
        css: './public/stylesheets/',
        js: './public/js/'
      }
    },

    // Task configuration
    sass: {
      options: {
        includePaths: ['<%= paths.src.vendor %>foundation/scss']
      },
      // compile the SASS files (Not compressed)
      dev: {
        files: {
          '<%= paths.dest.css %>app.css': '<%= paths.src.css %>app.scss'
        }
      },
      // compile compressed versions of the SASS files
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
