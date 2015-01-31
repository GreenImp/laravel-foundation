#!/usr/bin/env node


// include required modules
var exec    = require('child_process').exec,
    spawn   = require('child_process').spawn,
    fs      = require('fs'),
    mv      = require('mv'),
    rimraf  = require('rimraf'),
    merge   = require('node-merge'),
    targz   = require('tar.gz'),
    http    = require('http'),
    https   = require('https'),
    url     = require('url'),
    printf  = require('util').format;




var projectName       = process.argv[2],                                                              // project name - used for directory name
    projectPathParent = process.argv[3] || process.cwd().replace(new RegExp(projectName + '$'), '');  // path to the parent directory of the project
    projectPath       = projectPathParent + '/' + projectName;                                        // path to the project directory


const LOG_DIVIDER             = '====================================';


const SCRIPT_PATH             = __dirname;  // path to this script

const LARAVEL_PUBLIC_DIR      = 'public';

const FOUNDATION_FILE_EXT     = 'tar.gz';
const FOUNDATION_FILENAME     = 'master';
const FOUNDATION_INT_FILENAME = 'foundation-libsass-template-master';
const FOUNDATION_REPO_URL     = 'https://codeload.github.com/zurb/foundation-libsass-template/' + FOUNDATION_FILE_EXT + '/' + FOUNDATION_FILENAME;



var errorHandler          = function(errors){
      var i;

      if(!errors){
        // no errors defined - create a default
        errors = ['An error has occurred, please check the output above'];
      }else if(!Array.isArray(errors)){
        // ensure that the errors is an array
        errors = [errors];
      }

      console.error('ERROR:');

      // loop through and output each error
      for(i = 0; i < errors.length; i++){
        console.error(errors[i]);
      }

      process.exit(1);
    },
    /**
     * Handles `exec` commands and detects
     * success/failure status
     *
     * @param {string} str
     * @param {function=} successCallback
     * @param {function=} errorCallback
     */
    execHandler           = function(str, successCallback, errorCallback){
      exec(str, function(error, stdout, stderr){
        if(error !== null){
          (errorCallback || errorHandler).call(this, [printf('Code: %s', error.code), stderr]);
        }else if(successCallback){
          successCallback.call(this, stdout);
        }
      });
    },
    /**
     * Handles `spawn` commands
     *
     * @param {string} command
     * @param {Array=} arguments
     * @param {object=} options
     * @param {function=} successCallback
     * @param {function=} errorCallback
     * @returns {*}
     */
    spawnHandler          = function(command, arguments, options, successCallback, errorCallback){
      // TODO - merge options with out default
      /**
       * Setting `stdio` to 'inherit', to preserve output colours.
       *
       * @link http://stackoverflow.com/a/14231570
       * @type {*}
       */
      var s = spawn(command, arguments || [], {stdio: 'inherit'});

      // assign any callbacks
      s.on('close', function(code){
        if(code === 0){
          // success
          successCallback();
        }else{
          errorCallback();
        }
      });

      return s;
    },
    /**
     * Determines which request handler (http | https)
     * to use for the given URL, and returns the
     * appropriate one
     *
     * @param {string} location
     */
    getRequestHandler     = function(location){
      return (url.parse(location).protocol == 'https:') ? https : http;
    },
    /**
     * Downloads a file
     *
     * @param {string} src
     * @param {string} dest
     * @param {function=} successCallback
     * @param {function=} errorCallback
     */
    download              = function(src, dest, successCallback, errorCallback){
      console.log('Downloading file: %s', src);

      // open a file write stream
      var file  = fs.createWriteStream(dest);

      file.on('error', function(error){
        // delete the file
        fs.unlink(dest, null);

        if(errorCallback){
          errorCallback(error);
        }
      });


      // get the file and save it
      return getRequestHandler(src)
          .get(src, function(response){
            // write the file
            response.pipe(file);

            file.on('finish', function(){
              // close the file and trigger the callback
              file.close(successCallback);
            })
          })
          .on('error', function(error){
            // delete the file
            fs.unlink(dest, null);

            if(errorCallback){
              errorCallback(error);
            }
          });
    },
    /**
     * Extracts a zipped file
     *
     * @param {string} src
     * @param {string} dest
     * @param {function=} successCallback
     * @param {function=} errorCallback
     */
    extract               = function(src, dest, successCallback, errorCallback){
      console.log('Extracting file: %s', src);

      return new targz().extract(src, dest, function(err){
        if(err){
          errorCallback(err);
        }else{
          successCallback();
        }
      });
    },
    /**
     * Deletes a file or directory.
     * `file` can be an array of files/directories.
     *
     * @param {string|Array} file
     * @param {function} successCallback
     * @param {function} errorCallback
     */
    deleteFile            = function(file, successCallback, errorCallback){
      if(Array.isArray(file)){
        file.forEach(function(f){
          deleteFile(f, successCallback, errorCallback);
        });
      }else{
        console.log('Deleting file: %s', file);

        rimraf(file, function(err){
          if(err){
            errorCallback(err);
          }else{
            successCallback();
          }
        });
      }
    },
    /**
     * Moves a file or directory.
     * `file` can be an array of files/directories.
     *
     * @param {object|Array} file
     * @param {object=} options
     * @param {function} successCallback
     * @param {function} errorCallback
     */
    moveFile              = function(file, options, successCallback, errorCallback){
      if(Array.isArray(file)){
        file.forEach(function(f){
          moveFile(f, options, successCallback, errorCallback);
        })
      }else{
        console.log('Moving file: %s -> %s', file.src, file.dest);

        mv(file.src, file.dest, options || {}, function(err){
          if(err){
            errorCallback(err);
          }else{
            successCallback();
          }
        });
      }
    },
    copyFile              = function(src, dest, successCallback, errorCallback){
      console.log('Copying file: %s -> %s', src, dest);

      var cbCalled = false;

      var rd = fs.createReadStream(src);
      rd.on('error', done);

      var wr = fs.createWriteStream(dest);
      wr.on('error', done);
      wr.on('close', function(ex){
        done();
      });
      rd.pipe(wr);

      function done(err){
        if(!cbCalled){
          cbCalled = true;

          if(err){
            errorCallback(err);
          }else{
            successCallback();
          }
        }
      }
    },
    /**
     * Checks if the project directory
     * already exists or not
     *
     * @returns {boolean}
     */
    doesProjectExist      = function(){
      return !!fs.existsSync(projectPath);
    },
    /**
     * Changes the current working directory
     *
     * @param {string} location
     */
    goToDir               = function(location){
      try{
        process.chdir(location);
      }catch(error){
        errorHandler(error);
      }
    },
    /**
     * Changes the project directory
     */
    goToProjectDir        = function(){
      goToDir(projectPath);
    };



var init  = {
  /**
   * Installs the dependencies required
   * so that a project can be created.
   *
   * If dependencies aren't installed,
   * the general init functions will fail!
   *
   * @param {function=} callback
   */
  dependencies: function(callback){
    /*[Grunt](http://gruntjs.com/): Run `[sudo] npm install -g grunt-cli`
    * [Bower](http://bower.io): Run `[sudo] npm install -g bower`
    * [Composer](https://getcomposer.org/): See https://getcomposer.org/download/*/

    if(callback){
      callback();
    }
  },
  /**
   * Installs a Laravel project
   *
   * @link http://laravel.com/docs/quick
   * @param {function=} callback
   */
  laravel: function(callback){
    // check if the project directory already exists
    if(doesProjectExist()){
      // project directory already exists
      errorHandler(['The project directory already exists', 'Delete the directory or use a different project name to continue']);
    }

    console.log(LOG_DIVIDER);
    console.log('# Installing Laravel');

    // ensure that we're in the project parent
    goToDir(projectPathParent);

    // run the Laravel install command
    spawnHandler(
      'composer',
      ['create-project', 'laravel/laravel', projectName, '--prefer-dist'],
      null,
      function(){
        console.log('Laravel installed');

        if(callback){
          callback();
        }
      },
      errorHandler
    );
  },
  /**
   * Adds Foundation (libsass) to the project
   *
   * @link http://foundation.zurb.com/docs/sass.html
   * @param {function=} callback
   */
  foundation: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Foundation');

    var downloadPath  = projectPath + '/' + FOUNDATION_FILENAME,  // path to download foundation
        extractPath   = projectPath + '/' + FOUNDATION_FILENAME,  // path to extract the download
        publicPath    = projectPath + '/' + LARAVEL_PUBLIC_DIR;   // path to the Laravel public directory

    // download foundation and copy across any required files
    download(
      FOUNDATION_REPO_URL,
      downloadPath + '.' + FOUNDATION_FILE_EXT,
      function(){
        console.log('Download complete');

        // extract the files
        extract(
          downloadPath + '.' + FOUNDATION_FILE_EXT,
          projectPath + '/' + FOUNDATION_FILENAME,
          function(){
            console.log('\nMerging Foundation into Laravel');

            var count, fileList;


            // copy the Foundation files into the Laravel public directory
            // mergeTo is Synchronous!
            merge.mergeTo(extractPath + '/' + FOUNDATION_INT_FILENAME, publicPath);

            // move the files into the correct locations
            count     = 0;
            fileList  = [
              // move the JS into the assets directory
              {
                src: publicPath + '/js',
                dest: publicPath + '/assets/js'
              },
              // move the SCSS into the assets directory
              {
                src: publicPath + '/scss',
                dest: publicPath + '/assets/scss'
              },
              // move the bower file into the project root
              {
                src: publicPath + '/bower.json',
                dest: projectPath + '/bower.json'
              }
            ];
            moveFile(
              fileList,
              {mkdirp: true},
              function(){
                count++;

                if(count >= fileList.length){
                  // all files moved

                  console.log('Removing old files');
                  // remove the unnecessary Foundation files
                  count     = 0;
                  fileList  = [
                    // zipped Foundation folder
                    downloadPath + '.' + FOUNDATION_FILE_EXT,
                    // extracted Foundation folder
                    extractPath,
                    // Foundation's Gruntfile
                    publicPath + '/Gruntfile.js',
                    // Foundation's Readme (Not relevant)
                    publicPath + '/README.md'
                  ];
                  deleteFile(
                    fileList,
                    function(){
                      count++;

                      if(count >= fileList.length){
                        // all files deleted
                        console.log('Foundation installed');

                        if(callback){
                          callback();
                        }
                      }
                    },
                    errorHandler
                  );
                }
              },
              errorHandler
            );
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  /**
   * Creates .bowerrc and
   * installs bower modules
   *
   * @link http://bower.io/#getting-started
   * @param {function=} callback
   */
  bower: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Bower');

    // copy `.bowerrc` file into project root
    copyFile(
      SCRIPT_PATH + '/files/.bowerrc',
      projectPath + '/.bowerrc',
      function(){
        // ensure that we're in the project directory
        goToProjectDir();

        // install the bower modules
        console.log('Installing Bower modules');
        spawnHandler(
          'bower',
          ['install'],
          null,
          function(){
            console.log('Bower setup complete');

            if(callback){
              callback();
            }
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  /**
   * Installs Grunt dependencies
   * and creates Gruntfile.js
   *
   * @param {function=} callback
   */
  grunt: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Grunt');

    // copy `Gruntfile.js` file into project root
    copyFile(
      SCRIPT_PATH + '/files/Gruntfile.js',
      projectPath + '/Gruntfile.js',
      function(){
        // ensure that we're in the project directory
        goToProjectDir();

        console.log('Installing Grunt dependencies');

        // list of extra grunt dependencies
        var gruntDpdcy = [
          'grunt-contrib-uglify'
        ];

        spawnHandler(
          'npm',
          ['install', gruntDpdcy.join(' '), '--save'],
          null,
          function(){
            console.log('Grunt dependencies installed');

            if(callback){
              callback();
            }
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  all: function(){
    init.dependencies(function(){
      // install Laravel
      init.laravel(function(){
        // install Foundation
        init.foundation(function(){
          init.bower(function(){
            init.grunt();
          });
        });

        // set up NPM
        //spawnHandler('npm', ['init', '-f'], null, function(){}, errorHandler);
      });
    });
  }
};




if(!projectName){
  // no project name defined
  errorHandler('No project name defined');
}


console.log('Project directory: %s', projectPath);

// run the initialisation scripts
init.all();
