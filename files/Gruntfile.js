module.exports = function(grunt) {
  // Initializing the configuration object
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Paths variables
    paths: {
      // Development file locations, where we put SASS files etc.
      src: {
        css: './resources/assets/scss/',
        js: './resources/assets/js/',
        vendor: './public/assets/vendor/'
      },
      // Production file locations, where Grunt will output the files
      dest: {
        css: './public/assets/css/',
        js: './public/assets/js/',
        vendor: './public/assets/vendor/'
      }
    },

    // Task configuration
    // compile the SASS files
    sass: {
      options: {
        includePaths: ['<%= paths.src.vendor %>foundation/scss'],
        // @link https://github.com/sass/node-sass#outputstyle
        outputStyle: 'compressed',
        sourceMap: true
      },
      dist: {
        files: {
          '<%= paths.dest.css %>app.css': '<%= paths.src.css %>app.scss'
        }
      }
    },
    uglify: {
      options: {
        compress: true,
        mangle: false,  // change to true if you want obfuscation (Changed variable names etc)
        sourceMap: true
      },
      // minify JS files
      dist: {
        files: {
          '<%= paths.dest.js %>app.js': [
            '<%= paths.src.js %>app.js'
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
        tasks: ['sass']
      },
      uglify: {
        files: '<%= paths.src.js %>**/*.js',
        tasks: ['uglify']
      }
    }
  });

  // Plugin loading
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Task definition
  grunt.registerTask('build', ['sass', 'uglify']);  // create the dev files (SASS etc.)
  grunt.registerTask('default', ['build','watch']); // watch for changes and run dev builds
};
